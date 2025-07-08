import cron from 'node-cron'
import logger from './io/log.js'

async function runJob() {
  logger.info('Running scheduled supply drop script...')
  await import('./index.js')
}

logger.info(
  'Scheduling supply drop script to run every day at 8am (Europe/Stockholm)...',
)
cron.schedule('0 8 * * *', runJob, {
  scheduled: true,
  timezone: 'Europe/Stockholm',
})

// Run immediately on container start as well
runJob()

// Keep process alive
setInterval(() => {}, 1 << 30)
