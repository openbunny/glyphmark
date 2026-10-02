import { describe, expect, test } from "bun:test"
import { JSDOM } from "jsdom"

import { LAUNCHPAD_LISTING } from "../../tests/fixtures/launchpad.ts"
import { launchpad } from "./launchpad.ts"

const rootFrom = (html: string) => new JSDOM(html).window.document

describe("launchpad provider", () => {
  test("matches git.launchpad.net https only", () => {
    expect(
      launchpad.matches(
        new URL(
          "https://git.launchpad.net/ubuntu/+source/hello/tree/?h=ubuntu/devel"
        )
      )
    ).toBe(true)
    expect(launchpad.matches(new URL("https://github.com/acme/widgets"))).toBe(
      false
    )
    expect(
      launchpad.matches(
        new URL("http://git.launchpad.net/ubuntu/+source/hello/tree/")
      )
    ).toBe(false)
  })

  test("classifies debian as folder and configure.ac as file", () => {
    const rows = [...launchpad.rows(rootFrom(LAUNCHPAD_LISTING))]
    const byName = Object.fromEntries(rows.map((r) => [r.name, r.kind]))
    expect(byName["debian"]).toBe("folder")
    expect(byName["configure.ac"]).toBe("file")
  })

  test("iconTarget is the anchor", () => {
    const rows = [...launchpad.rows(rootFrom(LAUNCHPAD_LISTING))]
    for (const row of rows)
      expect(row.iconTarget.tagName.toLowerCase()).toBe("a")
  })

  test("observedRoot is the list table when document is set", () => {
    const dom = new JSDOM(LAUNCHPAD_LISTING)
    const globalDocument = globalThis.document
    globalThis.document = dom.window.document
    try {
      expect(launchpad.observedRoot()).toBe(
        dom.window.document.querySelector("table.list")
      )
    } finally {
      globalThis.document = globalDocument
    }
  })
})
