import { describe, expect, test } from "bun:test"
import { JSDOM } from "jsdom"

import { FORGEJO_LISTING } from "../../tests/fixtures/forgejo.ts"
import { forgejo } from "./forgejo.ts"

const rootFrom = (html: string) => new JSDOM(html).window.document

describe("forgejo provider", () => {
  test("matches only codeberg.org", () => {
    expect(
      forgejo.matches(new URL("https://codeberg.org/forgejo/forgejo"))
    ).toBe(true)
    expect(forgejo.matches(new URL("https://gitea.com/gitea/tea"))).toBe(false)
  })

  test("classifies every row kind from the entry table", () => {
    const rows = [...forgejo.rows(rootFrom(FORGEJO_LISTING))]
    const byName = Object.fromEntries(rows.map((r) => [r.name, r.kind]))
    expect(byName[".devcontainer"]).toBe("folder")
    expect(byName["go.mod"]).toBe("file")
    expect(byName["modules/git"]).toBe("submodule")
    expect(byName["current"]).toBe("symlink")
  })

  test("reads the name from data-entryname rather than trimmed link text", () => {
    const rows = [...forgejo.rows(rootFrom(FORGEJO_LISTING))]
    expect(rows.every((r) => r.name.trim() === r.name)).toBe(true)
  })
})
