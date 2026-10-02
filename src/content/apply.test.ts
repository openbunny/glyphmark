import { describe, expect, test } from "bun:test"
import { JSDOM } from "jsdom"

import { hasInlineStyle } from "../shared/dom.ts"
import type { Provider, Row } from "../shared/provider.ts"
import { DEFAULT_SETTINGS } from "../shared/settings.ts"
import { applyProviderIcons } from "./apply.ts"

const fixtureProvider = (doc: Document): Provider => ({
  id: "github",
  matches: () => true,
  rows: function* (root): Generator<Row> {
    for (const el of root.querySelectorAll("[data-name]")) {
      yield {
        kind: el.getAttribute("data-kind") === "folder" ? "folder" : "file",
        name: el.getAttribute("data-name") ?? "",
        iconTarget: el,
      }
    }
  },
  observedRoot: () => doc.body,
})

const makeDoc = () =>
  new JSDOM(
    `<div>
      <span data-name="main.rs"></span>
      <span data-name="src" data-kind="folder"></span>
    </div>`
  ).window.document

describe("applyProviderIcons", () => {
  test("inserts one icon per row using the injected icon URL resolver", () => {
    const doc = makeDoc()
    const provider = fixtureProvider(doc)
    const urls: string[] = []
    applyProviderIcons(provider, doc, DEFAULT_SETTINGS, (f) => {
      urls.push(f)
      return `icon:${f}`
    })
    const images = doc.querySelectorAll("img")
    expect(images.length).toBe(2)
    expect(urls.length).toBe(2)
  })

  test("repeated processing of the same DOM is idempotent", () => {
    const doc = makeDoc()
    const provider = fixtureProvider(doc)
    const iconUrl = (f: string) => `icon:${f}`
    applyProviderIcons(provider, doc, DEFAULT_SETTINGS, iconUrl)
    applyProviderIcons(provider, doc, DEFAULT_SETTINGS, iconUrl)
    applyProviderIcons(provider, doc, DEFAULT_SETTINGS, iconUrl)
    expect(doc.querySelectorAll("img").length).toBe(2)
  })

  test("sizes the injected icon from settings.iconSize", () => {
    const doc = makeDoc()
    const provider = fixtureProvider(doc)
    applyProviderIcons(
      provider,
      doc,
      { ...DEFAULT_SETTINGS, iconSize: "extraLarge" },
      (f) => `icon:${f}`
    )
    const image = doc.querySelector("img")
    expect(image?.width).toBe(24)
  })

  test("restores the original elements when the site is disabled", () => {
    const doc = makeDoc()
    const provider = fixtureProvider(doc)
    const settings = {
      ...DEFAULT_SETTINGS,
      siteEnabled: { ...DEFAULT_SETTINGS.siteEnabled, github: false },
    }
    applyProviderIcons(provider, doc, DEFAULT_SETTINGS, (f) => `icon:${f}`)
    expect(doc.querySelectorAll("img").length).toBe(2)
    applyProviderIcons(provider, doc, settings, (f) => `icon:${f}`)
    expect(doc.querySelectorAll("img").length).toBe(0)
    const target = doc.querySelector('[data-name="main.rs"]')
    if (!target) throw new Error("fixture: target not found")
    expect(hasInlineStyle(target) && target.style.display).not.toBe("none")
  })

  test("re-enabling after a disable re-applies icons without duplicating them", () => {
    const doc = makeDoc()
    const provider = fixtureProvider(doc)
    const disabled = {
      ...DEFAULT_SETTINGS,
      siteEnabled: { ...DEFAULT_SETTINGS.siteEnabled, github: false },
    }
    applyProviderIcons(provider, doc, DEFAULT_SETTINGS, (f) => `icon:${f}`)
    applyProviderIcons(provider, doc, disabled, (f) => `icon:${f}`)
    applyProviderIcons(provider, doc, DEFAULT_SETTINGS, (f) => `icon:${f}`)
    expect(doc.querySelectorAll("img").length).toBe(2)
  })
})
