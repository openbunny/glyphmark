import type { Provider, Row, RowKind } from "../shared/provider.ts"
import { matchesHost, rowsFrom } from "./util.ts"

const isRowKind = (value: string | null): value is RowKind =>
  value === "file" ||
  value === "folder" ||
  value === "submodule" ||
  value === "symlink"

const kindOf = (row: Element): RowKind => {
  const kind = row.getAttribute("data-kind")
  return isRowKind(kind) ? kind : "file"
}

const toRow = (row: Element): Row | null => {
  const icon = row.querySelector("[data-icon]")
  const link = row.querySelector("a")
  const name = link?.textContent?.trim()
  if (!name || !icon) return null
  return { kind: kindOf(row), name, iconTarget: icon }
}

export const tangled: Provider = {
  id: "tangled",
  matches: (url) => matchesHost(url, (h) => h === "tangled.org"),
  rows: (root) => rowsFrom(root, "[data-kind]", toRow),
  observedRoot: () => document.querySelector('[data-component="file-tree"]'),
}
