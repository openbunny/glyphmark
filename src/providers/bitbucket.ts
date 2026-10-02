import type { Provider, Row, RowKind } from "../shared/provider.ts"
import { matchesHost, rowsFrom } from "./util.ts"

const kindOf = (icon: Element): RowKind => {
  const label = icon.getAttribute("aria-label") ?? ""
  if (label === "Directory") return "folder"
  if (label === "Submodule") return "submodule"
  if (label === "Symlink") return "symlink"
  return "file"
}

const toRow = (row: Element): Row | null => {
  const icon = row.querySelector(
    '[data-qa="repository-source-list-row-icon"] svg'
  )
  const link = row.querySelector(
    '[data-qa="repository-source-list-row-name"] a'
  )
  const name = link?.textContent?.trim()
  if (!name || !icon) return null
  return { kind: kindOf(icon), name, iconTarget: icon }
}

export const bitbucket: Provider = {
  id: "bitbucket",
  matches: (url) => matchesHost(url, (h) => h === "bitbucket.org"),
  rows: (root) =>
    rowsFrom(root, '[data-qa="repository-source-list-row"]', toRow),
  observedRoot: () =>
    document.querySelector('[data-qa="repository-source-list"]'),
}
