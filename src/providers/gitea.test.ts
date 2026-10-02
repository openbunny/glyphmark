import { describe, expect, test } from "bun:test"
import { JSDOM } from "jsdom"

import { GITEA_LISTING } from "../../tests/fixtures/gitea.ts"
import { gitea } from "./gitea.ts"

const rootFrom = (html: string) => new JSDOM(html).window.document

describe("gitea provider", () => {
  test("matches only gitea.com", () => {
    expect(gitea.matches(new URL("https://gitea.com/gitea/tea"))).toBe(true)
    expect(gitea.matches(new URL("https://codeberg.org/forgejo/forgejo"))).toBe(
      false
    )
  })

  test("classifies every row kind from the file table", () => {
    const rows = [...gitea.rows(rootFrom(GITEA_LISTING))]
    const byName = Object.fromEntries(rows.map((r) => [r.name, r.kind]))
    expect(byName[".devcontainer"]).toBe("folder")
    expect(byName["main.go"]).toBe("file")
    expect(byName["modules/lib"]).toBe("submodule")
    expect(byName["current"]).toBe("symlink")
  })

  test("iconTarget is the entry's svg glyph", () => {
    const rows = [...gitea.rows(rootFrom(GITEA_LISTING))]
    for (const row of rows)
      expect(row.iconTarget.tagName.toLowerCase()).toBe("svg")
  })
})
