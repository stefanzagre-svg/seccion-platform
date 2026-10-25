export const SECCION_TELEGRAM_BOT_TOKEN = "8779277391:AAFigbudbO_qKxt68TXgkLMRVs5d2wCNZ30";
export const SECCION_TELEGRAM_CHAT_ID = "8717418370";

export async function sendTelegramNotification(message: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || SECCION_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || SECCION_TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("[Telegram Alert] Missing credentials, skipped alert");
    return false;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (res.ok) {
      return true;
    }

    const errText = await res.text().catch(() => "");
    console.warn(`[Telegram Alert] HTML dispatch failed (status ${res.status}): ${errText}`);

    // If Telegram returned 400 Bad Request (likely entity/HTML parse error), retry as clean plain text
    if (res.status === 400) {
      const plainText = message
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");

      const retryRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: plainText,
          disable_web_page_preview: true,
        }),
      });

      if (retryRes.ok) {
        return true;
      }
      const retryErr = await retryRes.text().catch(() => "");
      console.error(`[Telegram Alert] Plain text retry failed (status ${retryRes.status}):`, retryErr);
    }

    return false;
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    return false;
  }
}

