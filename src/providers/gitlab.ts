import type { Provider, Row, RowKind } from "../shared/provider.ts"
import { matchesHost, rowsFrom } from "./util.ts"

const HOSTS = new Set([
  "gitlab.com",
  "salsa.debian.org",
  "gitlab.gnome.org",
  "invent.kde.org",
  "gitlab.freedesktop.org",
  "git.drupalcode.org",
  "gitlab.archlinux.org",
  "gitlab.torproject.org",
  "framagit.org",
  "code.videolan.org",
])

const kindOf = (icon: Element | null): RowKind => {
  const testId = icon?.getAttribute("data-testid") ?? ""
  if (testId === "folder-icon" || testId === "folder-open-icon") return "folder"
  if (testId === "folder-git-icon") return "submodule"
  if (testId === "symlink-icon") return "symlink"
  return "file"
}

const toRow = (row: Element): Row | null => {
  const link = row.querySelector("a.tree-item-link, .tree-item-file-name a")
  const name = link?.textContent?.trim()
  const icon = row.querySelector(
    '.tree-item-file-name svg[data-testid$="-icon"], .tree-item-file-name svg'
  )
  if (!name || !icon) return null
  return { kind: kindOf(icon), name, iconTarget: icon }
}

export const gitlab: Provider = {
  id: "gitlab",
  matches: (url) => matchesHost(url, (h) => HOSTS.has(h)),
  rows: (root) => rowsFrom(root, "tr.tree-item, li.tree-item", toRow),
  observedRoot: () => document.getElementById("js-tree-list"),
}
