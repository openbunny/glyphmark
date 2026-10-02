import { describe, expect, test } from "bun:test"

import { DEFAULT_SETTINGS } from "./settings.ts"
import {
  readSettings,
  resetSettings,
  type StorageArea,
  writeSettings,
} from "./storage.ts"

class FakeStorage implements StorageArea {
  data: Record<string, unknown> = {}
  get(keys: string[]) {
    return Promise.resolve(
      Object.fromEntries(
        keys.filter((k) => k in this.data).map((k) => [k, this.data[k]])
      )
    )
  }
  set(items: Record<string, unknown>) {
    Object.assign(this.data, items)
    return Promise.resolve()
  }
}

describe("readSettings", () => {
  test("returns defaults when nothing is stored", async () => {
    const settings = await readSettings(new FakeStorage())
    expect(settings).toEqual(DEFAULT_SETTINGS)
  })

  test("returns defaults instead of throwing when storage holds garbage", async () => {
    const storage = new FakeStorage()
    storage.data["settings"] = "not a settings object"
    const settings = await readSettings(storage)
    expect(settings).toEqual(DEFAULT_SETTINGS)
  })
})

describe("writeSettings / readSettings", () => {
  test("round-trips through the storage area", async () => {
    const storage = new FakeStorage()
    const custom = {
      ...DEFAULT_SETTINGS,
      enabled: false,
      iconSize: "large" as const,
    }
    await writeSettings(storage, custom)
    const read = await readSettings(storage)
    expect(read).toEqual(custom)
  })
})

describe("resetSettings", () => {
  test("writes and returns the defaults", async () => {
    const storage = new FakeStorage()
    await writeSettings(storage, { ...DEFAULT_SETTINGS, enabled: false })
    const reset = await resetSettings(storage)
    expect(reset).toEqual(DEFAULT_SETTINGS)
    expect(await readSettings(storage)).toEqual(DEFAULT_SETTINGS)
  })
})
