import cron from 'node-cron'
import logger from './io/log.js'
import { sendPushNotification } from './io/pushover.js'
import { run } from './index.js'

type JobLogger = Pick<typeof logger, 'error' | 'info' | 'warn'>
type RunFn = () => Promise<void>
type NotifyFn = typeof sendPushNotification

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

export async function runJob(
  runSupplyDrop: RunFn = run,
  notify: NotifyFn = sendPushNotification,
  jobLogger: JobLogger = logger,
): Promise<void> {
  jobLogger.info('Running scheduled supply drop script...')

  try {
    await runSupplyDrop()
  } catch (err) {
    jobLogger.error({ err }, 'Scheduled supply drop script failed')
    try {
      await notify(
        '[Error] Scheduled supply drop script failed',
        toErrorMessage(err),
      )
    } catch (notificationErr) {
      jobLogger.warn(
        { err: notificationErr },
        'Failed to send scheduled job failure notification',
      )
    }
  }
}

export function startScheduler(): NodeJS.Timeout {
  logger.info(
    'Scheduling supply drop script to run every day at 8am (Europe/Stockholm)...',
  )
  cron.schedule(
    '0 8 * * *',
    () => {
      void runJob()
    },
    {
      scheduled: true,
      timezone: 'Europe/Stockholm',
    },
  )

  // Run immediately on container start as well.
  void runJob()

  // Keep process alive between scheduled runs.
  return setInterval(() => {}, 1 << 30)
}

if (process.env.NODE_ENV !== 'test') {
  startScheduler()
}
