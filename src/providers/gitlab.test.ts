import { describe, expect, test } from "bun:test"
import { JSDOM } from "jsdom"

import { GITLAB_LISTING } from "../../tests/fixtures/gitlab.ts"
import { gitlab } from "./gitlab.ts"

const rootFrom = (html: string) => new JSDOM(html).window.document

describe("gitlab provider", () => {
  test("matches public GitLab instance hosts", () => {
    for (const host of [
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
    ]) {
      expect(gitlab.matches(new URL(`https://${host}/a/b`))).toBe(true)
    }
  })

  test("rejects gitlab.example.com", () => {
    expect(gitlab.matches(new URL("https://gitlab.example.com/a/b"))).toBe(
      false
    )
  })

  test("rejects http gitlab.com", () => {
    expect(gitlab.matches(new URL("http://gitlab.com/a/b"))).toBe(false)
  })

  test("rejects github.com", () => {
    expect(gitlab.matches(new URL("https://github.com/a/b"))).toBe(false)
  })

  test("classifies every row kind by its icon test id", () => {
    const rows = [...gitlab.rows(rootFrom(GITLAB_LISTING))]
    const byName = Object.fromEntries(rows.map((r) => [r.name, r.kind]))
    expect(byName["lib"]).toBe("folder")
    expect(byName["README.md"]).toBe("file")
    expect(byName["vendor"]).toBe("submodule")
    expect(byName["current"]).toBe("symlink")
  })

  test("observedRoot is the tree list container", () => {
    const dom = new JSDOM(GITLAB_LISTING)
    const globalDocument = globalThis.document
    globalThis.document = dom.window.document
    try {
      expect(gitlab.observedRoot()?.id).toBe("js-tree-list")
    } finally {
      globalThis.document = globalDocument
    }
  })
})
