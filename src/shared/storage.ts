import { DEFAULT_SETTINGS, parseSettings, type Settings } from "./settings.ts"

const STORAGE_KEY = "settings"

export interface StorageArea {
  get(keys: string[]): Promise<Record<string, unknown>>
  set(items: Record<string, unknown>): Promise<void>
}

export const readSettings = async (storage: StorageArea): Promise<Settings> => {
  const stored = await storage.get([STORAGE_KEY])
  return parseSettings(stored[STORAGE_KEY])
}

export const writeSettings = async (
  storage: StorageArea,
  settings: Settings
): Promise<void> => {
  await storage.set({ [STORAGE_KEY]: settings })
}

export const resetSettings = async (
  storage: StorageArea
): Promise<Settings> => {
  await writeSettings(storage, DEFAULT_SETTINGS)
  return DEFAULT_SETTINGS
}
