import type { Provider, Row, RowKind } from "../shared/provider.ts"
import { matchesHost, rowsFrom } from "./util.ts"

const kindOf = (row: Element, icon: Element): RowKind => {
  const dataType = row.getAttribute("data-type")
  if (dataType === "submodule") return "submodule"
  if (dataType === "symlink") return "symlink"
  const cls = icon.getAttribute("class") ?? ""
  return cls.includes("ico-folder") ? "folder" : "file"
}

const toRow = (row: Element): Row | null => {
  const icon = row.querySelector("td.name .ico")
  const link = row.querySelector("td.name a")
  const name = link?.textContent?.trim()
  if (!name || !icon) return null
  return { kind: kindOf(row, icon), name, iconTarget: icon }
}

export const sourceforge: Provider = {
  id: "sourceforge",
  matches: (url) => matchesHost(url, (h) => h === "sourceforge.net"),
  rows: (root) => rowsFrom(root, "table.files tbody tr", toRow),
  observedRoot: () => document.querySelector("table.files"),
}
