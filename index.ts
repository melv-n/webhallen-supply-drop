import { getAuthCookie, openSupplyDrop, getSupplyDrops, SupplyDrop } from './io/webhallen.js'
import { hasSetupPushover } from './io/pushover.js'
import logger from './io/log.js'
import { sendPushNotification } from './io/pushover.js'

if (!process.env.WEBHALLEN_USERNAME || !process.env.WEBHALLEN_PASSWORD) {
  logger.error('Missing required environment variables: WEBHALLEN_USERNAME and/or WEBHALLEN_PASSWORD')
  process.exit(1)
}

process.on('unhandledRejection', async (reason: any) => {
  logger.error('Unhandled Rejection:', reason)
  await sendPushNotification('[Crash] Unhandled Rejection', String(reason))
  process.exit(1)
})

process.on('uncaughtException', async (err: Error) => {
  logger.error('Uncaught Exception:', err)
  await sendPushNotification('[Crash] Uncaught Exception', err.message)
  process.exit(1)
})

;(async () => {
  if (!hasSetupPushover()) {
    logger.warn(`Pushover not setup -- won't send any push notifications`)
  }

  const cookie = await getAuthCookie(process.env.WEBHALLEN_USERNAME, process.env.WEBHALLEN_PASSWORD)
  if (!cookie) {
    logger.error('Failed to get auth cookie. Exiting.')
    await sendPushNotification('[Error] Failed to get auth cookie')
    process.exit(1)
  }

  const drops = await getSupplyDrops(cookie)
  logger.info('Current supply drops: ' + (drops?.length ?? 'unknown'))

  try {
    await openSupplyDrop(cookie)
  } catch (err: any) {
    logger.error('Failed to open supply drop:', err)
    await sendPushNotification('[Error] Failed to open supply drop', err?.message || String(err))
  }
})()
