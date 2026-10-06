const api = (token: string, method: string) => `https://api.telegram.org/bot${token}/${method}`;

export async function sendMessage(token: string, chatId: number, text: string): Promise<void> {
  const res = await fetch(api(token, "sendMessage"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  const body = (await res.json()) as { ok: boolean; description?: string };
  if (!body.ok) throw new Error(`Telegram sendMessage: ${body.description}`);
}

// Downloads the image ourselves and uploads it, so Telegram never has to fetch a long map URL.
export async function sendPhoto(token: string, chatId: number, imageUrl: string, caption: string): Promise<void> {
  const img = await fetch(imageUrl);
  if (!img.ok) throw new Error(`Map image ${img.status}`);
  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append("caption", caption);
  form.append("photo", new Blob([await img.arrayBuffer()], { type: "image/png" }), "route.png");
  const res = await fetch(api(token, "sendPhoto"), { method: "POST", body: form });
  const body = (await res.json()) as { ok: boolean; description?: string };
  if (!body.ok) throw new Error(`Telegram sendPhoto: ${body.description}`);
}

type Update ={ message?: { chat: { id: number; type: string } } };

// The chat id of whoever last messaged the bot privately, or null if nobody has.
export async function latestChatId(token: string): Promise<number | null> {
  const res = await fetch(api(token, "getUpdates"));
  const body = (await res.json()) as { ok: boolean; result: Update[]; description?: string };
  if (!body.ok) throw new Error(`Telegram getUpdates: ${body.description}`);
  const chats = body.result.map((u) => u.message?.chat).filter((c) => c?.type === "private");
  return chats.at(-1)?.id ?? null;
}
