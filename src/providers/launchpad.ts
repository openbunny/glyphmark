import type { Provider, Row } from "../shared/provider.ts"
import { matchesHost, rowsFrom } from "./util.ts"

const toRow = (el: Element): Row | null => {
  const name = el.textContent?.trim()
  if (!name) return null
  return {
    kind: el.classList.contains("ls-dir") ? "folder" : "file",
    name,
    iconTarget: el,
  }
}

export const launchpad: Provider = {
  id: "launchpad",
  matches: (url) => matchesHost(url, (h) => h === "git.launchpad.net"),
  rows: (root) =>
    rowsFrom(root, "table.list a.ls-dir, table.list a.ls-blob", toRow),
  observedRoot: () =>
    document.querySelector("table.list") ?? document.getElementById("cgit"),
}
