import { getAuthCookie, openSupplyDrop, getSupplyDrops, SupplyDrop } from './io/webhallen.js'
import { hasSetupPushover } from './io/pushover.js'
import logger from './io/log.js'

if (!process.env.WEBHALLEN_USERNAME || !process.env.WEBHALLEN_PASSWORD) {
  logger.error('Missing required environment variables: WEBHALLEN_USERNAME and/or WEBHALLEN_PASSWORD')
  process.exit(1)
}

(async () => {
  if (!hasSetupPushover()) {
    logger.warn(`Pushover not setup -- won't send any push notifications`)
  }

  const cookie = await getAuthCookie(process.env.WEBHALLEN_USERNAME, process.env.WEBHALLEN_PASSWORD)
  if (!cookie) {
    logger.error('Failed to get auth cookie. Exiting.')
    process.exit(1)
  }

  const drops = await getSupplyDrops(cookie)

  logger.info('Current supply drops: ' + drops?.length || 'unknown')

  await openSupplyDrop(cookie)
})() 