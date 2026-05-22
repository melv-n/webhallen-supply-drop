import { afterEach, describe, expect, it, vi } from 'vitest'
import { sendPushNotification } from '../io/pushover.js'

describe('sendPushNotification', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('returns false instead of throwing when Pushover fetch fails', async () => {
    vi.stubEnv('PUSHOVER_TOKEN', 'token')
    vi.stubEnv('PUSHOVER_USER', 'user')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('fetch failed')),
    )

    await expect(sendPushNotification('hello')).resolves.toBe(false)
  })

  it('returns false for non-200 Pushover responses', async () => {
    vi.stubEnv('PUSHOVER_TOKEN', 'token')
    vi.stubEnv('PUSHOVER_USER', 'user')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 500 }))

    await expect(sendPushNotification('hello')).resolves.toBe(false)
  })
})
