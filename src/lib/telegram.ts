/**
 * Telegram Notification Utility
 * 
 * This utility handles sending notifications via Telegram Bot API.
 * 
 * Setup Instructions:
 * 1. Create a Telegram Bot via @BotFather on Telegram
 * 2. Get the Bot Token from BotFather
 * 3. Get the Chat ID of the recipient (see below)
 * 4. Add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to your .env file
 * 
 * To get Chat ID:
 * - Forward a message to @userinfobot or
 * - Use the Telegram API: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
 *   after sending a message to your bot
 */

interface TelegramResponse {
  ok: boolean;
  result?: unknown;
  description?: string;
}

interface SendMessageOptions {
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  disable_notification?: boolean;
}

/**
 * Send a message via Telegram Bot API
 * @param message - The message to send
 * @param options - Optional settings for the message
 * @returns Promise<boolean> - True if message was sent successfully
 */
export async function sendTelegramNotification(
  message: string,
  options: SendMessageOptions = {}
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Check if Telegram is configured
  if (!botToken || !chatId) {
    console.warn('Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured');
    return false;
  }

  const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: options.parse_mode || 'HTML',
        disable_notification: options.disable_notification || false,
      }),
    });

    const data: TelegramResponse = await response.json();

    if (!data.ok) {
      console.error('Telegram API error:', data.description);
      return false;
    }

    console.log('Telegram notification sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
}

/**
 * Send notification for new order placement
 * @param orderCode - The order code
 * @param productName - The product name
 * @param customerName - The customer name
 * @param salesmanName - The salesman name (optional)
 */
export async function sendNewOrderNotification(
  orderCode: string,
  productName: string,
  customerName: string,
  salesmanName?: string
): Promise<boolean> {
  const message = `
🆕 <b>New Order Placed</b>

📦 <b>Order No:</b> ${orderCode}
📝 <b>Product:</b> ${productName}
👤 <b>Customer:</b> ${customerName}
${salesmanName ? `🧑‍💼 <b>Salesman:</b> ${salesmanName}` : ''}

⏰ <b>Time:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Please check the admin panel for details.
  `.trim();

  return sendTelegramNotification(message);
}

/**
 * Send notification for order edit
 * @param orderCode - The order code
 * @param productName - The product name
 * @param salesmanName - The salesman name (optional)
 */
export async function sendOrderEditNotification(
  orderCode: string,
  productName: string,
  salesmanName?: string
): Promise<boolean> {
  const message = `
✏️ <b>Order Edited</b>

📦 <b>Order No:</b> ${orderCode}
📝 <b>Product:</b> ${productName}
${salesmanName ? `🧑‍💼 <b>Edited by:</b> ${salesmanName}` : ''}

⏰ <b>Time:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Please check the updated details in the admin panel.
  `.trim();

  return sendTelegramNotification(message);
}

/**
 * Send notification for order status change
 * @param orderCode - The order code
 * @param newStatus - The new status
 */
export async function sendOrderStatusNotification(
  orderCode: string,
  newStatus: string
): Promise<boolean> {
  const statusEmoji: Record<string, string> = {
    'confirmed': '✅',
    'order_view_and_accepted': '👁️',
    'cad_completed': '🎨',
    'production_floor': '🏭',
    'finished': '🎉',
    'dispatched': '🚚',
    'cancelled': '❌',
  };

  const emoji = statusEmoji[newStatus] || '📋';
  const formattedStatus = newStatus.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const message = `
${emoji} <b>Order Status Updated</b>

📦 <b>Order No:</b> ${orderCode}
📊 <b>New Status:</b> ${formattedStatus}

⏰ <b>Time:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
  `.trim();

  return sendTelegramNotification(message);
}
