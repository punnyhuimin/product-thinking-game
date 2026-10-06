const api = (token: string, method: string) => `https://api.telegram.org/bot${token}/${method}`;

export type Keyboard = { text: string; callback_data: string }[][];

type Chat = { id: number; type: string };
export type Update = {
  update_id: number;
  message?: { date: number; chat: Chat; text?: string; location?: { latitude: number; longitude: number } };
  callback_query?: { id: string; data?: string; message?: { message_id: number; chat: Chat } };
};

async function call<T>(token: string, method: string, payload: object): Promise<T> {
  const res = await fetch(api(token, method), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await res.json()) as { ok: boolean; result: T; description?: string; error_code?: number };
  if (!body.ok) throw Object.assign(new Error(`Telegram ${method}: ${body.description}`), { code: body.error_code });
  return body.result;
}

export async function sendMessage(token: string, chatId: number, text: string, keyboard?: Keyboard): Promise<void> {
  await call(token, "sendMessage", {
    chat_id: chatId,
    text,
    ...(keyboard && { reply_markup: { inline_keyboard: keyboard } }),
  });
}

// Swaps a message's text and drops its buttons, so a list can't be tapped twice.
export async function editMessage(token: string, chatId: number, messageId: number, text: string): Promise<void> {
  await call(token, "editMessageText", { chat_id: chatId, message_id: messageId, text });
}

// Stops the button's loading spinner.
export async function answerCallback(token: string, id: string): Promise<void> {
  await call(token, "answerCallbackQuery", { callback_query_id: id });
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

// Long-polls for new updates. Fails with code 409 while a webhook is set.
export const getUpdates = (token: string, offset: number, timeoutSec = 30) =>
  call<Update[]>(token, "getUpdates", { offset, timeout: timeoutSec, allowed_updates: ["message", "callback_query"] });

// Telegram will POST every update to `url`, sending `secret` in a header.
export const setWebhook = (token: string, url: string, secret: string) =>
  call<true>(token, "setWebhook", { url, secret_token: secret, allowed_updates: ["message", "callback_query"] });
