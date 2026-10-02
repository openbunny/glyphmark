import type { IconManifest, MitManifest, PackOverride } from "./types.ts"
import {
  assertNoExternalAssetReference,
  assertValidFilename,
  buildUniqueRecord,
  GenerationError,
} from "./validate.ts"

const basename = (iconPath: string): string => {
  const safe = assertNoExternalAssetReference(iconPath)
  const parts = safe.split("/")
  const last = parts.at(-1)
  if (!last) throw new GenerationError(`empty icon path: "${iconPath}"`)
  return assertValidFilename(last)
}

const iconKeyToFilename = (
  key: string,
  iconDefinitions: MitManifest["iconDefinitions"]
): string => {
  const def = iconDefinitions[key]
  if (!def)
    throw new GenerationError(`icon definition missing for key "${key}"`)
  return basename(def.iconPath)
}

const table = (
  label: string,
  entries: Record<string, string> | undefined
): Record<string, string> =>
  buildUniqueRecord(label, Object.entries(entries ?? {}))

const diffTable = (
  base: Record<string, string> | undefined,
  variant: Record<string, string> | undefined
): Record<string, string> => {
  const baseEntries = base ?? {}
  const variantEntries = variant ?? {}
  const changed = Object.entries(variantEntries).filter(
    ([key, value]) => baseEntries[key] !== value
  )
  return buildUniqueRecord("pack override", changed)
}

const requireDefault = (label: string, value: string | undefined): string => {
  if (!value) throw new GenerationError(`missing default icon key: ${label}`)
  return value
}

export const buildIconManifest = (
  base: MitManifest,
  packVariants: Record<string, MitManifest>
): IconManifest => {
  const referencedKeys = new Set<string>()
  const track = (record: Record<string, string>): Record<string, string> => {
    for (const key of Object.values(record)) referencedKeys.add(key)
    return record
  }

  const fileExtensionIcon = track(table("fileExtensions", base.fileExtensions))
  const fileNameIcon = track(table("fileNames", base.fileNames))
  const folderNameIcon = track(table("folderNames", base.folderNames))
  const folderNameExpandedIcon = track(
    table("folderNamesExpanded", base.folderNamesExpanded)
  )
  const rootFolderNameIcon = track(
    table("rootFolderNames", base.rootFolderNames)
  )
  const rootFolderNameExpandedIcon = track(
    table("rootFolderNamesExpanded", base.rootFolderNamesExpanded)
  )
  const defaultFileIcon = requireDefault("file", base.file)
  const defaultFolderIcon = requireDefault("folder", base.folder)
  const defaultFolderExpandedIcon = requireDefault(
    "folderExpanded",
    base.folderExpanded
  )
  referencedKeys.add(defaultFileIcon)
  referencedKeys.add(defaultFolderIcon)
  referencedKeys.add(defaultFolderExpandedIcon)

  const packs: Record<string, PackOverride> = {}
  for (const [packId, variant] of Object.entries(packVariants)) {
    const folderNames = diffTable(base.folderNames, variant.folderNames)
    const folderNamesExpanded = diffTable(
      base.folderNamesExpanded,
      variant.folderNamesExpanded
    )
    const fileNames = diffTable(base.fileNames, variant.fileNames)
    const fileExtensions = diffTable(
      base.fileExtensions,
      variant.fileExtensions
    )
    const tables: [keyof PackOverride, Record<string, string>][] = [
      ["folderNameIcon", folderNames],
      ["folderNameExpandedIcon", folderNamesExpanded],
      ["fileNameIcon", fileNames],
      ["fileExtensionIcon", fileExtensions],
    ]
    const nonEmpty = tables.filter(
      ([, entries]) => Object.keys(entries).length > 0
    )
    const override: Partial<
      Record<keyof PackOverride, Record<string, string>>
    > = {}
    for (const [field, entries] of nonEmpty) {
      override[field] = entries
      for (const key of Object.values(entries)) referencedKeys.add(key)
    }
    if (nonEmpty.length > 0) packs[packId] = override
  }

  const icons = buildUniqueRecord(
    "icons",
    [...referencedKeys]
      .sort()
      .map(
        (key) => [key, iconKeyToFilename(key, base.iconDefinitions)] as const
      )
  )

  return {
    fileExtensionIcon,
    fileNameIcon,
    folderNameIcon,
    folderNameExpandedIcon,
    rootFolderNameIcon,
    rootFolderNameExpandedIcon,
    defaultFileIcon,
    defaultFolderIcon,
    defaultFolderExpandedIcon,
    packs,
    icons,
  }
}
