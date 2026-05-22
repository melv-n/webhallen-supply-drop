import { describe, expect, it, vi } from 'vitest'
import { runJob } from '../scheduler.js'

describe('runJob', () => {
  it('logs and sends one best-effort notification when the job fails', async () => {
    const runSupplyDrop = vi.fn().mockRejectedValue(new Error('network down'))
    const notify = vi.fn().mockResolvedValue(false)
    const jobLogger = {
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    }

    await expect(
      runJob(runSupplyDrop, notify, jobLogger),
    ).resolves.toBeUndefined()

    expect(runSupplyDrop).toHaveBeenCalledTimes(1)
    expect(jobLogger.error).toHaveBeenCalledTimes(1)
    expect(notify).toHaveBeenCalledTimes(1)
    expect(jobLogger.warn).not.toHaveBeenCalled()
  })
})
