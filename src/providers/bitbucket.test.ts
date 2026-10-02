import { describe, expect, test } from "bun:test"
import { JSDOM } from "jsdom"

import { BITBUCKET_LISTING } from "../../tests/fixtures/bitbucket.ts"
import { bitbucket } from "./bitbucket.ts"

const rootFrom = (html: string) => new JSDOM(html).window.document

describe("bitbucket provider", () => {
  test("matches only bitbucket.org", () => {
    expect(
      bitbucket.matches(new URL("https://bitbucket.org/acme/widgets"))
    ).toBe(true)
    expect(
      bitbucket.matches(new URL("https://bitbucket.example.com/acme/widgets"))
    ).toBe(false)
  })

  test("classifies every row kind by the icon's aria-label", () => {
    const rows = [...bitbucket.rows(rootFrom(BITBUCKET_LISTING))]
    const byName = Object.fromEntries(rows.map((r) => [r.name, r.kind]))
    expect(byName["lib"]).toBe("folder")
    expect(byName["README.md"]).toBe("file")
    expect(byName["vendor"]).toBe("submodule")
    expect(byName["current"]).toBe("symlink")
  })
})
