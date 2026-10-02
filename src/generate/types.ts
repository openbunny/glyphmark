export interface PackOverride {
  readonly folderNameIcon?: Record<string, string>
  readonly folderNameExpandedIcon?: Record<string, string>
  readonly fileNameIcon?: Record<string, string>
  readonly fileExtensionIcon?: Record<string, string>
}

export interface IconManifest {
  readonly fileExtensionIcon: Record<string, string>
  readonly fileNameIcon: Record<string, string>
  readonly folderNameIcon: Record<string, string>
  readonly folderNameExpandedIcon: Record<string, string>
  readonly rootFolderNameIcon: Record<string, string>
  readonly rootFolderNameExpandedIcon: Record<string, string>
  readonly defaultFileIcon: string
  readonly defaultFolderIcon: string
  readonly defaultFolderExpandedIcon: string
  readonly packs: Record<string, PackOverride>
  readonly icons: Record<string, string>
}

export interface MitManifest {
  readonly iconDefinitions: Record<string, { iconPath: string }>
  readonly folderNames?: Record<string, string>
  readonly folderNamesExpanded?: Record<string, string>
  readonly rootFolderNames?: Record<string, string>
  readonly rootFolderNamesExpanded?: Record<string, string>
  readonly fileExtensions?: Record<string, string>
  readonly fileNames?: Record<string, string>
  readonly file?: string
  readonly folder?: string
  readonly folderExpanded?: string
  readonly rootFolder?: string
  readonly rootFolderExpanded?: string
}
