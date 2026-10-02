import { describe, expect, test } from "bun:test"
import { JSDOM } from "jsdom"

import { GITHUB_LISTING } from "../../tests/fixtures/github.ts"
import { github } from "./github.ts"

const rootFrom = (html: string) => new JSDOM(html).window.document

describe("github provider", () => {
  test("matches only github.com", () => {
    expect(github.matches(new URL("https://github.com/acme/widgets"))).toBe(
      true
    )
    expect(github.matches(new URL("https://gitlab.com/acme/widgets"))).toBe(
      false
    )
    expect(github.matches(new URL("https://notgithub.com/acme/widgets"))).toBe(
      false
    )
  })

  test("classifies every row kind from the listing table", () => {
    const rows = [...github.rows(rootFrom(GITHUB_LISTING))]
    const byName = Object.fromEntries(rows.map((r) => [r.name, r.kind]))
    expect(byName[".github"]).toBe("folder")
    expect(byName["README.md"]).toBe("file")
    expect(byName["vendor/lib"]).toBe("submodule")
    expect(byName["latest"]).toBe("symlink")
  })

  test("yields a row for each responsive filename column so the visible cell is replaced", () => {
    const rows = [...github.rows(rootFrom(GITHUB_LISTING))]
    expect(rows.length).toBe(8)
    expect(new Set(rows.map((row) => row.iconTarget)).size).toBe(8)
  })

  test("each row's iconTarget is the octicon svg for that entry", () => {
    const doc = rootFrom(GITHUB_LISTING)
    const rows = [...github.rows(doc)]
    for (const row of rows) {
      expect(row.iconTarget.tagName.toLowerCase()).toBe("svg")
    }
  })

  test("observedRoot is the turbo-frame that survives client-side navigation", () => {
    const dom = new JSDOM(GITHUB_LISTING)
    const globalDocument = globalThis.document
    globalThis.document = dom.window.document
    try {
      expect(github.observedRoot()?.id).toBe("repo-content-turbo-frame")
    } finally {
      globalThis.document = globalDocument
    }
  })

  test("a row missing a title falls out of the listing rather than throwing", () => {
    const doc = rootFrom(
      GITHUB_LISTING.replaceAll('title=".github"', "").replaceAll(
        'aria-label=".github, (Directory)"',
        ""
      )
    )
    expect(() => [...github.rows(doc)]).not.toThrow()
    const rows = [...github.rows(doc)]
    expect(rows.find((r) => r.name === ".github")).toBeUndefined()
  })
})
