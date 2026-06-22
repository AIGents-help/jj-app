const PER_IP_LIMIT = 20;
const PER_IP_WINDOW_MS = 10 * 60 * 1000;
const DAILY_LIMIT = 1500;

const ipWindows = new Map();
let dailyCount = 0;
let dailyDate = new Date().toISOString().slice(0, 10);

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

export function checkRateLimit(req) {
  const now = Date.now();

  const today = todayUTC();
  if (today !== dailyDate) { dailyDate = today; dailyCount = 0; }

  if (dailyCount >= DAILY_LIMIT) {
    const midnight = new Date(today + "T00:00:00Z");
    midnight.setUTCDate(midnight.getUTCDate() + 1);
    return { ok: false, retryAfter: Math.ceil((midnight.getTime() - now) / 1000) };
  }

  const forwarded = req.headers["x-forwarded-for"];
  const ip = (forwarded ? forwarded.split(",")[0].trim() : req.socket?.remoteAddress) || "unknown";

  const timestamps = (ipWindows.get(ip) || []).filter(t => now - t < PER_IP_WINDOW_MS);
  if (timestamps.length >= PER_IP_LIMIT) {
    return { ok: false, retryAfter: Math.ceil((timestamps[0] + PER_IP_WINDOW_MS - now) / 1000) };
  }

  timestamps.push(now);
  ipWindows.set(ip, timestamps);
  dailyCount++;
  return { ok: true };
}
