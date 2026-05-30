import { ingestRequest } from '../webhooks/webhook.service.js'

export const handleTelegramMessage = async (req, res) => {
  try {
    const { message } = req.body

    if (!message || !message.text) {
      return res.sendStatus(200)
    }

    const customerName = [message.from?.first_name, message.from?.last_name]
      .filter(Boolean)
      .join(' ') || 'Telegram User'

    await ingestRequest({
        message: message.text,
        customerName,
        source: 'TELEGRAM', 
        actor: 'telegram_webhook',
        metadata: {
            telegramMessageId: message.message_id,
            chatId: message.chat?.id
        }
        })

    res.sendStatus(200)

  } catch (err) {
    console.error('Telegram controller error:', err)
    res.sendStatus(200)
  }
}