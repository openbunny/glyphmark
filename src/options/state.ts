import { ICON_MANIFEST } from "../generated/mappings.ts"
import type { ProviderId } from "../shared/provider.ts"
import {
  DEFAULT_SETTINGS,
  type IconMapping,
  type Settings,
} from "../shared/settings.ts"

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  github: "GitHub",
  bitbucket: "Bitbucket",
  azureDevops: "Azure DevOps",
  gitlab: "GitLab",
  gitea: "Gitea",
  gitee: "Gitee",
  sourceforge: "SourceForge",
  forgejo: "Codeberg",
  tangled: "Tangled",
}

export const ICON_PACK_OPTIONS: readonly string[] = [
  "",
  ...Object.keys(ICON_MANIFEST.packs),
]

export const iconKeyExists = (key: string): boolean =>
  Object.hasOwn(ICON_MANIFEST.icons, key)

export const iconUrlForKey = (key: string): string | undefined =>
  Object.hasOwn(ICON_MANIFEST.icons, key) ? ICON_MANIFEST.icons[key] : undefined

export const setGlobalEnabled = (
  settings: Settings,
  enabled: boolean
): Settings => ({
  ...settings,
  enabled,
})

export const setSiteEnabled = (
  settings: Settings,
  id: ProviderId,
  enabled: boolean
): Settings => ({
  ...settings,
  siteEnabled: { ...settings.siteEnabled, [id]: enabled },
})

export const setIconSize = (
  settings: Settings,
  iconSize: Settings["iconSize"]
): Settings => ({
  ...settings,
  iconSize,
})

export const setIconPack = (
  settings: Settings,
  iconPack: string
): Settings => ({
  ...settings,
  iconPack,
})

type MappingField = "customFileNames" | "customExtensions" | "customFolderNames"

export const setMappingEntry = (
  settings: Settings,
  field: MappingField,
  key: string,
  value: string
): Settings => ({
  ...settings,
  [field]: { ...settings[field], [key]: value } satisfies IconMapping,
})

export const removeMappingEntry = (
  settings: Settings,
  field: MappingField,
  key: string
): Settings => {
  const next = { ...settings[field] }
  delete next[key]
  return { ...settings, [field]: next }
}

export const resetToDefaults = (): Settings => DEFAULT_SETTINGS
