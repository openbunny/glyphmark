export type RowKind = "file" | "folder" | "submodule" | "symlink"
export type FolderState = "open" | "closed"

export interface Row {
  readonly kind: RowKind
  readonly name: string
  readonly folderState?: FolderState
  readonly iconTarget: Element
}

export interface Provider {
  readonly id: string
  matches(url: URL): boolean
  rows(root: ParentNode): Iterable<Row>
  observedRoot(): Element | null
}

export const PROVIDER_IDS = [
  "github",
  "bitbucket",
  "azureDevops",
  "gitlab",
  "gitea",
  "gitee",
  "sourceforge",
  "forgejo",
  "tangled",
] as const

export type ProviderId = (typeof PROVIDER_IDS)[number]

export const isProviderId = (value: unknown): value is ProviderId =>
  typeof value === "string" && PROVIDER_IDS.some((id) => id === value)
