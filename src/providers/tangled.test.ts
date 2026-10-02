import { describe, expect, test } from "bun:test"
import { JSDOM } from "jsdom"

import { TANGLED_LISTING } from "../../tests/fixtures/tangled.ts"
import { tangled } from "./tangled.ts"

const rootFrom = (html: string) => new JSDOM(html).window.document

describe("tangled provider", () => {
  test("matches only tangled.org", () => {
    expect(
      tangled.matches(new URL("https://tangled.org/@acme.example/widgets"))
    ).toBe(true)
    expect(
      tangled.matches(new URL("https://example.org/@acme.example/widgets"))
    ).toBe(false)
  })

  test("classifies every row kind from data-kind", () => {
    const rows = [...tangled.rows(rootFrom(TANGLED_LISTING))]
    const byName = Object.fromEntries(rows.map((r) => [r.name, r.kind]))
    expect(byName["src"]).toBe("folder")
    expect(byName["README.md"]).toBe("file")
    expect(byName["vendor"]).toBe("submodule")
    expect(byName["current"]).toBe("symlink")
  })

  test("falls back to file for an unrecognized data-kind value", () => {
    const doc = rootFrom(
      TANGLED_LISTING.replace('data-kind="submodule"', 'data-kind="odd"')
    )
    const rows = [...tangled.rows(doc)]
    expect(rows.find((r) => r.name === "vendor")?.kind).toBe("file")
  })
})
