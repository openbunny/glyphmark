import type { Provider, Row, RowKind } from "../shared/provider.ts"
import { matchesHost, rowsFrom } from "./util.ts"

const kindOf = (icon: Element): RowKind => {
  const cls = icon.getAttribute("class") ?? ""
  if (cls.includes("icon-folder")) return "folder"
  if (cls.includes("icon-submodule")) return "submodule"
  if (cls.includes("icon-symlink")) return "symlink"
  return "file"
}

const toRow = (row: Element): Row | null => {
  const icon = row.querySelector(".iconfont")
  const link = row.querySelector("a.name, a[title]")
  const name = link?.getAttribute("title") ?? link?.textContent?.trim()
  if (!name || !icon) return null
  return { kind: kindOf(icon), name, iconTarget: icon }
}

export const gitee: Provider = {
  id: "gitee",
  matches: (url) => matchesHost(url, (h) => h === "gitee.com"),
  rows: (root) => rowsFrom(root, ".tree-item", toRow),
  observedRoot: () => document.querySelector(".tree-content"),
}
