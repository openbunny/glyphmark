import { ICON_MANIFEST } from "../generated/mappings.ts"
import type { IconManifest } from "../generate/types.ts"
import type { Row } from "./provider.ts"
import type { Settings } from "./settings.ts"

const extensionOf = (name: string): string | undefined => {
  const idx = name.lastIndexOf(".")
  return idx > 0 ? name.slice(idx + 1).toLowerCase() : undefined
}

const validKey = (
  manifest: IconManifest,
  key: string | undefined
): string | undefined =>
  key !== undefined && Object.hasOwn(manifest.icons, key) ? key : undefined

const own = <T>(
  table: Readonly<Record<string, T>> | undefined,
  key: string
): T | undefined =>
  table !== undefined && Object.hasOwn(table, key) ? table[key] : undefined

const resolveFolderIcon = (
  manifest: IconManifest,
  settings: Settings,
  lowerName: string,
  open: boolean
): string => {
  const custom = validKey(manifest, own(settings.customFolderNames, lowerName))
  if (custom) return custom
  const pack = own(manifest.packs, settings.iconPack)
  const packTable = open ? pack?.folderNameExpandedIcon : pack?.folderNameIcon
  const baseTable = open
    ? manifest.folderNameExpandedIcon
    : manifest.folderNameIcon
  return (
    validKey(manifest, own(packTable, lowerName)) ??
    validKey(manifest, own(baseTable, lowerName)) ??
    (open ? manifest.defaultFolderExpandedIcon : manifest.defaultFolderIcon)
  )
}

const resolveFileIcon = (
  manifest: IconManifest,
  settings: Settings,
  lowerName: string
): string => {
  const customName = validKey(
    manifest,
    own(settings.customFileNames, lowerName)
  )
  if (customName) return customName
  const ext = extensionOf(lowerName)
  const customExt = ext
    ? validKey(manifest, own(settings.customExtensions, ext))
    : undefined
  if (customExt) return customExt
  const pack = own(manifest.packs, settings.iconPack)
  const byName =
    validKey(manifest, own(pack?.fileNameIcon, lowerName)) ??
    validKey(manifest, own(manifest.fileNameIcon, lowerName))
  if (byName) return byName
  const byExt = ext
    ? (validKey(manifest, own(pack?.fileExtensionIcon, ext)) ??
      validKey(manifest, own(manifest.fileExtensionIcon, ext)))
    : undefined
  return byExt ?? manifest.defaultFileIcon
}

export const resolveIconKey = (
  row: Pick<Row, "kind" | "name" | "folderState">,
  settings: Settings,
  manifest: IconManifest = ICON_MANIFEST
): string => {
  const lowerName = row.name.toLowerCase()
  return row.kind === "folder"
    ? resolveFolderIcon(
        manifest,
        settings,
        lowerName,
        row.folderState === "open"
      )
    : resolveFileIcon(manifest, settings, lowerName)
}

export const iconFilenameFor = (
  row: Pick<Row, "kind" | "name" | "folderState">,
  settings: Settings,
  manifest: IconManifest = ICON_MANIFEST
): string => {
  const key = resolveIconKey(row, settings, manifest)
  const filename =
    own(manifest.icons, key) ?? own(manifest.icons, manifest.defaultFileIcon)
  if (!filename) throw new Error(`missing icon for ${key}`)
  return filename
}
