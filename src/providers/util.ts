import type { Row } from "../shared/provider.ts"

export const rowsFrom = function* (
  root: ParentNode,
  selector: string,
  toRow: (el: Element) => Row | null
): Generator<Row> {
  for (const el of root.querySelectorAll(selector)) {
    const row = toRow(el)
    if (row) yield row
  }
}

export const matchesHost = (
  url: URL,
  hostname: (h: string) => boolean
): boolean => url.protocol === "https:" && hostname(url.hostname)
