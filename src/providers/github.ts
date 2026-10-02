import type { Provider, Row, RowKind } from "../shared/provider.ts"
import { matchesHost, rowsFrom } from "./util.ts"

const kindOf = (svg: Element): RowKind => {
  const cls = svg.getAttribute("class") ?? ""
  if (cls.includes("icon-directory")) return "folder"
  if (cls.includes("octicon-file-submodule")) return "submodule"
  if (cls.includes("octicon-file-symlink-file")) return "symlink"
  return "file"
}

const toRow = (column: Element): Row | null => {
  const name = column.querySelector("a[title]")?.getAttribute("title")
  const svg = column.querySelector("svg")
  if (!name || !svg) return null
  return { kind: kindOf(svg), name, iconTarget: svg }
}

export const github: Provider = {
  id: "github",
  matches: (url) => matchesHost(url, (h) => h === "github.com"),
  rows: (root) => rowsFrom(root, ".react-directory-filename-column", toRow),
  observedRoot: () => document.getElementById("repo-content-turbo-frame"),
}
