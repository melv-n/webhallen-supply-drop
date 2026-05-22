import {
  getAuthCookie,
  openSupplyDrop,
  getSupplyDrops,
} from './io/webhallen.js'
import { hasSetupPushover } from './io/pushover.js'
import logger from './io/log.js'
import { sendPushNotification } from './io/pushover.js'

type CrashLogger = Pick<typeof logger, 'error'>
type NotifyFn = typeof sendPushNotification
type ExitFn = (code?: number) => never | void

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

export function validateRequiredEnv(exit: ExitFn = process.exit): boolean {
  if (process.env.WEBHALLEN_USERNAME && process.env.WEBHALLEN_PASSWORD) {
    return true
  }

  logger.error(
    'Missing required environment variables: WEBHALLEN_USERNAME and/or WEBHALLEN_PASSWORD',
  )
  exit(1)
  return false
}

export async function handleUnhandledRejection(
  reason: unknown,
  exit: ExitFn = process.exit,
  notify: NotifyFn = sendPushNotification,
  crashLogger: CrashLogger = logger,
): Promise<void> {
  try {
    crashLogger.error({ err: reason }, 'Unhandled Rejection')
    await notify('[Crash] Unhandled Rejection', toErrorMessage(reason))
  } catch (err) {
    crashLogger.error({ err }, 'Failed to send crash notification')
  } finally {
    exit(1)
  }
}

export async function handleUncaughtException(
  err: Error,
  exit: ExitFn = process.exit,
  notify: NotifyFn = sendPushNotification,
  crashLogger: CrashLogger = logger,
): Promise<void> {
  try {
    crashLogger.error({ err }, 'Uncaught Exception')
    await notify('[Crash] Uncaught Exception', err.message)
  } catch (notificationErr) {
    crashLogger.error(
      { err: notificationErr },
      'Failed to send crash notification',
    )
  } finally {
    exit(1)
  }
}

export function installCrashHandlers(): void {
  process.on('unhandledRejection', (reason) => {
    void handleUnhandledRejection(reason)
  })

  process.on('uncaughtException', (err) => {
    void handleUncaughtException(err)
  })
}

if (process.env.NODE_ENV !== 'test') {
  validateRequiredEnv()
  installCrashHandlers()
}

export async function run() {
  if (!hasSetupPushover()) {
    logger.warn('Pushover not setup -- will not send any push notifications')
  }

  const cookie = await getAuthCookie(
    process.env.WEBHALLEN_USERNAME,
    process.env.WEBHALLEN_PASSWORD,
  )
  if (!cookie) {
    logger.error('Failed to get auth cookie. Exiting.')
    await sendPushNotification('[Error] Failed to get auth cookie')
    return
  }

  const drops = await getSupplyDrops(cookie)
  if (!drops) {
    logger.error('Failed to get current supply drops. Skipping open attempt.')
    await sendPushNotification('[Error] Failed to get current supply drops')
    return
  }

  logger.info('Current supply drops: ' + drops.length)

  try {
    await openSupplyDrop(cookie)
  } catch (err: unknown) {
    logger.error('Failed to open supply drop:', err)
    await sendPushNotification(
      '[Error] Failed to open supply drop',
      toErrorMessage(err),
    )
  }
}
