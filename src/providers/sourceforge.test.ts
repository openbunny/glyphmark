import { describe, expect, test } from "bun:test"
import { JSDOM } from "jsdom"

import { SOURCEFORGE_LISTING } from "../../tests/fixtures/sourceforge.ts"
import { sourceforge } from "./sourceforge.ts"

const rootFrom = (html: string) => new JSDOM(html).window.document

describe("sourceforge provider", () => {
  test("matches only sourceforge.net", () => {
    expect(
      sourceforge.matches(new URL("https://sourceforge.net/p/sevenzip/code"))
    ).toBe(true)
    expect(
      sourceforge.matches(new URL("https://example.net/p/sevenzip/code"))
    ).toBe(false)
  })

  test("classifies folders, files, submodules, and symlinks", () => {
    const rows = [...sourceforge.rows(rootFrom(SOURCEFORGE_LISTING))]
    const byName = Object.fromEntries(rows.map((r) => [r.name, r.kind]))
    expect(byName["CPP"]).toBe("folder")
    expect(byName["README"]).toBe("file")
    expect(byName["vendor"]).toBe("submodule")
    expect(byName["current"]).toBe("symlink")
  })

  test("ignores the header row, which has no name cell", () => {
    const rows = [...sourceforge.rows(rootFrom(SOURCEFORGE_LISTING))]
    expect(rows.length).toBe(4)
  })
})
