import pino from 'pino'
import { sendPushNotification } from './pushover.js'

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: { colorize: true }
  } : undefined
})

export function errorAndPush(...args: any[]) {
  const msg = args.map(String).join(' ')
  logger.error(msg)
  sendPushNotification('[Error]', msg)
}

export default logger 