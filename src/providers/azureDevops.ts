import type { FolderState, Provider, Row, RowKind } from "../shared/provider.ts"
import { matchesHost, rowsFrom } from "./util.ts"

const kindOf = (row: Element): RowKind => {
  const itemType = row.getAttribute("data-item-type")
  if (itemType === "submodule") return "submodule"
  if (itemType === "symlink") return "symlink"
  return row.hasAttribute("aria-expanded") ? "folder" : "file"
}

const folderStateOf = (
  row: Element,
  kind: RowKind
): FolderState | undefined => {
  if (kind !== "folder") return undefined
  return row.getAttribute("aria-expanded") === "true" ? "open" : "closed"
}

const toRow = (row: Element): Row | null => {
  const name = row.getAttribute("aria-label")
  const icon = row.querySelector(
    ".bolt-tree-icon, .repos-explorer-icon, [class*='icon']"
  )
  if (!name || !icon) return null
  const kind = kindOf(row)
  const folderState = folderStateOf(row, kind)
  return {
    kind,
    name,
    iconTarget: icon,
    ...(folderState !== undefined && { folderState }),
  }
}

export const azureDevops: Provider = {
  id: "azureDevops",
  matches: (url) =>
    matchesHost(
      url,
      (h) => h === "dev.azure.com" || h.endsWith(".visualstudio.com")
    ),
  rows: (root) => rowsFrom(root, '[role="treeitem"]', toRow),
  observedRoot: () => document.querySelector('[role="tree"]'),
}
