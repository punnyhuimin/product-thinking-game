import { createHmac, timingSafeEqual } from "node:crypto";

const sign = (chatId: number, secret: string) => createHmac("sha256", secret).update(String(chatId)).digest("base64url");

// A key the web app sends to act as this Telegram chat: "<chatId>.<signature>".
export function signLink(chatId: number, secret: string): string {
  return `${chatId}.${sign(chatId, secret)}`;
}

// The chat a key belongs to, or null if it wasn't signed with this secret.
export function verifyLink(key: string, secret: string): number | null {
  const [, id, sig] = key.match(/^(-?\d+)\.([\w-]+)$/) ?? [];
  if (!id) return null;
  const chatId = Number(id);
  const got = Buffer.from(sig);
  const want = Buffer.from(sign(chatId, secret));
  return got.length === want.length && timingSafeEqual(got, want) ? chatId : null;
}
