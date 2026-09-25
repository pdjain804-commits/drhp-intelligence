async function redis(command: unknown[]) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`Upstash request failed: ${res.status}`);
  return res.json();
}

export async function wasProcessed(id: string) {
  const result = await redis(["EXISTS", `drhp:${id}`]);
  return Boolean(result?.result);
}

export async function markProcessed(id: string) {
  await redis(["SET", `drhp:${id}`, "1", "EX", "2592000"]);
}

export async function sendEmail(subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL;
  const to = process.env.ALERT_TO_EMAIL;
  if (!apiKey || !from || !to) return false;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html }),
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`Resend request failed: ${res.status}`);
  return true;
}
