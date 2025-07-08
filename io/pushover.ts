import chalk from 'chalk'
import logger from './log.js'

export function hasSetupPushover(): boolean {
  return Boolean(process.env.PUSHOVER_TOKEN && process.env.PUSHOVER_USER)
}

export async function sendPushNotification(...message: string[]): Promise<void> {
  if (!hasSetupPushover()) { return }
  
  let msg = message.join ? message.join(' ') : message as unknown as string

  logger.debug('Sending push notification: ' + msg)

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
  })

  if (response.status !== 200) {
    logger.error(`Unexpected status from PushOver API: got ${response.status} but expected 200`)
    return
  }
  
  logger.info('Successfully sent PushOver Notification')
} 