-- ============================================================
-- REVEAL — Supabase schema (entitlement + journal)
-- Run order: paste into Supabase SQL editor, or save as the first migration.
-- Built for: gate paid features by Stripe subscription state.
-- ============================================================

-- ----------------------------------------------------------------
-- 1. PROFILES  (one row per authed user, created on signup)
-- ----------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  created_at  timestamptz not null default now()
);

-- auto-create a profile row whenever a new auth user appears
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------
-- 2. SUBSCRIPTIONS  (mirror of Stripe state; written by the webhook)
-- ----------------------------------------------------------------
create table if not exists public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid references public.profiles(id) on delete cascade,
  stripe_customer_id      text,
  stripe_subscription_id  text unique,
  price_id                text,
  tier                    text,          -- '90day' | '6month' | 'annual' | 'founding_annual'
  cohort                  text,          -- 'founding' | null
  status                  text not null, -- 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid'
  current_period_end      timestamptz,
  cancel_at_period_end    boolean default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists idx_subscriptions_user on public.subscriptions(user_id);
create index if not exists idx_subscriptions_customer on public.subscriptions(stripe_customer_id);

-- single source of truth for "can this user use the paid layer?"
create or replace function public.is_active_subscriber(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = uid
      and status in ('active','trialing')
      and (current_period_end is null or current_period_end > now())
  );
$$;

-- ----------------------------------------------------------------
-- 3. ENTRIES  (cloud journal — the localStorage migration target)
--    Mirrors the journey:entry:YYYY-MM-DD key schema as rows.
-- ----------------------------------------------------------------
create table if not exists public.entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  entry_date  date not null,
  data        jsonb not null default '{}'::jsonb,   -- full entry payload
  updated_at  timestamptz not null default now(),
  unique (user_id, entry_date)
);

create index if not exists idx_entries_user_date on public.entries(user_id, entry_date);

-- ----------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
--    Users touch only their own rows. The Stripe webhook writes
--    subscriptions via the service-role key (bypasses RLS).
-- ----------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.subscriptions enable row level security;
alter table public.entries       enable row level security;

-- profiles: owner read/update
create policy "profiles_self_read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id);

-- subscriptions: owner read only (no client writes — webhook owns this table)
create policy "subs_self_read" on public.subscriptions for select using (auth.uid() = user_id);

-- entries: owner full CRUD
create policy "entries_self_read"   on public.entries for select using (auth.uid() = user_id);
create policy "entries_self_insert" on public.entries for insert with check (auth.uid() = user_id);
create policy "entries_self_update" on public.entries for update using (auth.uid() = user_id);
create policy "entries_self_delete" on public.entries for delete using (auth.uid() = user_id);

-- keep updated_at honest
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists t_subs_touch on public.subscriptions;
create trigger t_subs_touch before update on public.subscriptions
  for each row execute function public.touch_updated_at();

drop trigger if exists t_entries_touch on public.entries;
create trigger t_entries_touch before update on public.entries
  for each row execute function public.touch_updated_at();

-- ============================================================
-- WEBHOOK CONTRACT (for the Vercel serverless fn that will live
-- at /api/stripe-webhook.js — handle these events):
--   checkout.session.completed         -> upsert subscription (link customer<->user via client_reference_id or email)
--   customer.subscription.updated      -> update status / current_period_end / cancel_at_period_end
--   customer.subscription.deleted      -> set status='canceled'
--   invoice.payment_failed             -> set status='past_due'
-- App reads is_active_subscriber(auth.uid()) to unlock the AI coach,
-- cloud sync, and the Reveal/Reckoning/Reset history.
-- ============================================================
