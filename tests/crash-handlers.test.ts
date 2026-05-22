import { describe, expect, it, vi } from 'vitest'
import { handleUncaughtException, handleUnhandledRejection } from '../index.js'

describe('crash handlers', () => {
  it('exits after an unhandled rejection even when crash notification fails', async () => {
    const exit = vi.fn()
    const notify = vi.fn().mockRejectedValue(new Error('pushover down'))
    const crashLogger = { error: vi.fn() }

    await handleUnhandledRejection(new Error('boom'), exit, notify, crashLogger)

    expect(notify).toHaveBeenCalledTimes(1)
    expect(exit).toHaveBeenCalledWith(1)
  })

  it('exits after an uncaught exception even when crash notification fails', async () => {
    const exit = vi.fn()
    const notify = vi.fn().mockRejectedValue(new Error('pushover down'))
    const crashLogger = { error: vi.fn() }

    await handleUncaughtException(new Error('boom'), exit, notify, crashLogger)

    expect(notify).toHaveBeenCalledTimes(1)
    expect(exit).toHaveBeenCalledWith(1)
  })
})
