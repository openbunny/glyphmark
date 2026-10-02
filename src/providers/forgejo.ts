import type { Provider, Row, RowKind } from "../shared/provider.ts"
import { matchesHost, rowsFrom } from "./util.ts"

const kindOf = (svg: Element): RowKind => {
  const cls = svg.getAttribute("class") ?? ""
  if (cls.includes("octicon-file-directory-fill")) return "folder"
  if (cls.includes("octicon-file-submodule")) return "submodule"
  if (cls.includes("octicon-file-symlink-file")) return "symlink"
  return "file"
}

const toRow = (row: Element): Row | null => {
  const name = row.getAttribute("data-entryname")
  const svg = row.querySelector("td.name svg")
  if (!name || !svg) return null
  return { kind: kindOf(svg), name, iconTarget: svg }
}

export const forgejo: Provider = {
  id: "forgejo",
  matches: (url) => matchesHost(url, (h) => h === "codeberg.org"),
  rows: (root) => rowsFrom(root, "tr.entry[data-entryname]", toRow),
  observedRoot: () =>
    document.querySelector(".page-content.repository.file.list"),
}
