import logger from './log.js'

const PUSHOVER_TIMEOUT_MS = 10_000

export function hasSetupPushover(): boolean {
  return Boolean(process.env.PUSHOVER_TOKEN && process.env.PUSHOVER_USER)
}

export async function sendPushNotification(
  ...message: string[]
): Promise<boolean> {
  if (!hasSetupPushover()) return false

  const msg = message.join(' ')

  logger.debug('Sending push notification: ' + msg)

  try {
    const response = await fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        token: process.env.PUSHOVER_TOKEN,
        user: process.env.PUSHOVER_USER,
        message: msg,
      }),
      signal: AbortSignal.timeout(PUSHOVER_TIMEOUT_MS),
    })

    if (response.status !== 200) {
      logger.error(
        `Unexpected status from PushOver API: got ${response.status} but expected 200`,
      )
      return false
    }

    logger.info('Successfully sent PushOver Notification')
    return true
  } catch (err) {
    const detail =
      err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    logger.warn(`Failed to send PushOver notification: ${detail}`)
    return false
  }
}
