import type { Provider, Row, RowKind } from "../shared/provider.ts"
import { matchesHost, rowsFrom } from "./util.ts"

const kindOf = (svg: Element): RowKind => {
  const cls = svg.getAttribute("class") ?? ""
  if (cls.includes("octicon-file-directory-fill")) return "folder"
  if (cls.includes("octicon-file-submodule")) return "submodule"
  if (cls.includes("octicon-file-symlink-file")) return "symlink"
  return "file"
}

const toRow = (svg: Element): Row | null => {
  const link = svg.parentElement?.querySelector("a.entry-name[title]")
  const name = link?.getAttribute("title")
  if (!name) return null
  return { kind: kindOf(svg), name, iconTarget: svg }
}

export const gitea: Provider = {
  id: "gitea",
  matches: (url) => matchesHost(url, (h) => h === "gitea.com"),
  rows: (root) =>
    rowsFrom(root, "#repo-files-table .repo-file-cell.name svg", toRow),
  observedRoot: () => document.getElementById("repo-files-table"),
}
