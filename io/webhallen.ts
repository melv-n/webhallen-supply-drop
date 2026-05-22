import logger from './log.js'
import { sendPushNotification } from './pushover.js'

function extractSetCookie(setCookie: string): string {
  const webhallen = setCookie.match(/webhallen=([a-zA-Z0-9]*)/g)
  const last_visit = setCookie.match(/last_visit=([0-9]*)/g)
  const auth = setCookie.match(/webhallen_auth=([a-zA-Z0-9\%_]*)/)
  return webhallen + '; ' + last_visit + (auth ? '; ' + auth[0] : '')
}

export async function getAuthCookie(
  username?: string,
  password?: string,
): Promise<string | undefined> {
  let r: Response
  try {
    r = await fetch('https://www.webhallen.com/api/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })
  } catch (err) {
    logger.error({ err }, 'Webhallen login request failed')
    return
  }

  if (r.status !== 200) {
    logger.error(
      `Webhallen login: unexpected status - got ${r.status} but expected 200`,
    )
    return
  }
  logger.info('Webhallen login successful')
  return extractSetCookie(r.headers.get('set-cookie') || '')
}

export async function openSupplyDrop(cookie: string): Promise<void> {
  let r: Response
  try {
    r = await fetch('https://www.webhallen.com/api/supply-drop', {
      method: 'POST',
      headers: {
        cookie: cookie,
      },
    })
  } catch (err) {
    logger.error({ err }, 'Webhallen supply-drop open request failed')
    return
  }

  if (r.status === 403) {
    logger.warn(
      'Got a 403 when trying to open supply drop, this likely means it is not ready yet',
    )
    return
  } else if (r.status !== 200) {
    logger.error(
      `Webhallen supply-drop: unexpected status - got ${r.status} but expected 200`,
    )
    return
  }

  const json = (await r.json()) as { drops?: SupplyDropItem[] }

  if (!json.drops) {
    logger.error('Missing `drops` in response body')
    return
  }

  json.drops.forEach((drop) => {
    logger.info(`${drop.name} (${drop.description})`)
    void sendPushNotification(`${drop.name} (${drop.description})`)
  })
}

export interface SupplyDropItem {
  id: number
  name: string
  iconName: string
  description: string
}

export interface SupplyDrop {
  item: SupplyDropItem
  count: number
}

export async function getSupplyDrops(
  cookie: string,
): Promise<SupplyDrop[] | undefined> {
  let r: Response
  try {
    r = await fetch('https://www.webhallen.com/api/supply-drop', {
      method: 'GET',
      headers: {
        cookie: cookie,
      },
    })
  } catch (err) {
    logger.error({ err }, 'Webhallen supply-drop list request failed')
    return
  }

  if (r.status !== 200) {
    logger.error(
      `Webhallen supply-drop (list): unexpected status - got ${r.status} but expected 200`,
    )
    return
  }

  const json = await r.json()
  if (!json.drops) {
    logger.error('Missing `drops` in response body (list)')
    return
  }
  return json.drops as SupplyDrop[]
}
