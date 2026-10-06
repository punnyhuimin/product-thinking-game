// The key from the bot's /web link, which tells the backend which Telegram user this browser is.
const STORAGE_KEY = "leave-alert-key";

let key: string | null = null;

// Takes ?key= from a /web link, remembers it, and removes it from the address bar so it isn't shared by accident.
export function captureKey() {
  const url = new URL(window.location.href);
  const fromUrl = url.searchParams.get("key");
  try {
    if (fromUrl) localStorage.setItem(STORAGE_KEY, fromUrl);
    key = fromUrl ?? localStorage.getItem(STORAGE_KEY);
  } catch {
    key = fromUrl; // storage blocked: keep it for this visit only
  }
  if (fromUrl) {
    url.searchParams.delete("key");
    history.replaceState(null, "", url);
  }
}

export const getKey = () => key;
