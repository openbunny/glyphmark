import { z } from "zod"

import { PROVIDER_IDS, type ProviderId } from "./provider.ts"

const ICON_SIZES = ["small", "medium", "large", "extraLarge"] as const
export type IconSize = (typeof ICON_SIZES)[number]

export const isIconSize = (value: unknown): value is IconSize =>
  typeof value === "string" && ICON_SIZES.some((size) => size === value)

export const ICON_SIZE_PX: Record<IconSize, number> = {
  small: 12,
  medium: 16,
  large: 20,
  extraLarge: 24,
}

export type IconMapping = Record<string, string>

export interface Settings {
  readonly enabled: boolean
  readonly siteEnabled: Record<ProviderId, boolean>
  readonly iconSize: IconSize
  readonly iconPack: string
  readonly customFileNames: IconMapping
  readonly customExtensions: IconMapping
  readonly customFolderNames: IconMapping
}

const DEFAULT_SITE_ENABLED: Record<ProviderId, boolean> = {
  github: true,
  bitbucket: true,
  azureDevops: true,
  gitlab: true,
  gitea: true,
  gitee: true,
  sourceforge: true,
  forgejo: true,
  tangled: true,
}

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  siteEnabled: DEFAULT_SITE_ENABLED,
  iconSize: "medium",
  iconPack: "",
  customFileNames: {},
  customExtensions: {},
  customFolderNames: {},
}

const MAX_MAPPING_ENTRIES = 500
const MAX_KEY_LENGTH = 120
const MAX_VALUE_LENGTH = 120

const booleanSchema = z.boolean()
const iconSizeSchema = z.enum(ICON_SIZES)
const iconPackSchema = z.string().max(MAX_KEY_LENGTH)
const providerIdSchema = z.enum(PROVIDER_IDS)
const RESERVED_NAMES: ReadonlySet<string> = new Set([
  ...Object.getOwnPropertyNames(Object.prototype),
  "prototype",
])
const isUsableName = (name: string): boolean => !RESERVED_NAMES.has(name)
const mappingKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(MAX_KEY_LENGTH)
  .refine(isUsableName)
const mappingValueSchema = z
  .string()
  .trim()
  .min(1)
  .max(MAX_VALUE_LENGTH)
  .refine(isUsableName)

const withDefault = <T>(schema: z.ZodType<T>, fallback: T, raw: unknown): T => {
  const result = schema.safeParse(raw)
  return result.success ? result.data : fallback
}

const isRecord = (raw: unknown): raw is Record<string, unknown> =>
  typeof raw === "object" && raw !== null && !Array.isArray(raw)

const asRecord = (raw: unknown): Record<string, unknown> =>
  isRecord(raw) ? raw : {}

const normalizeSiteEnabled = (raw: unknown): Record<ProviderId, boolean> => {
  const source = asRecord(raw)
  const result = { ...DEFAULT_SITE_ENABLED }
  for (const id of PROVIDER_IDS) {
    const idResult = providerIdSchema.safeParse(id)
    if (!idResult.success) continue
    const value = source[id]
    result[id] = withDefault(booleanSchema, DEFAULT_SITE_ENABLED[id], value)
  }
  return result
}

const normalizeMapping = (raw: unknown): IconMapping => {
  const source = asRecord(raw)
  const result: IconMapping = {}
  for (const [key, value] of Object.entries(source)) {
    if (Object.keys(result).length >= MAX_MAPPING_ENTRIES) break
    const keyResult = mappingKeySchema.safeParse(key)
    const valueResult = mappingValueSchema.safeParse(value)
    if (!keyResult.success || !valueResult.success) continue
    result[keyResult.data] = valueResult.data
  }
  return result
}

export const parseSettings = (raw: unknown): Settings => {
  const source = asRecord(raw)
  return {
    enabled: withDefault(
      booleanSchema,
      DEFAULT_SETTINGS.enabled,
      source["enabled"]
    ),
    siteEnabled: normalizeSiteEnabled(source["siteEnabled"]),
    iconSize: withDefault(
      iconSizeSchema,
      DEFAULT_SETTINGS.iconSize,
      source["iconSize"]
    ),
    iconPack: withDefault(
      iconPackSchema,
      DEFAULT_SETTINGS.iconPack,
      source["iconPack"]
    ),
    customFileNames: normalizeMapping(source["customFileNames"]),
    customExtensions: normalizeMapping(source["customExtensions"]),
    customFolderNames: normalizeMapping(source["customFolderNames"]),
  }
}

export const isSiteEnabled = (settings: Settings, id: ProviderId): boolean =>
  settings.enabled && settings.siteEnabled[id]
