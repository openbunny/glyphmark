import { describe, expect, test } from "bun:test"
import { JSDOM } from "jsdom"

import type { NavigationWindow } from "./navigate.ts"
import type { Provider, Row } from "../shared/provider.ts"
import { DEFAULT_SETTINGS } from "../shared/settings.ts"
import { watchProvider } from "./watch.ts"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const makeWindow = (bodyHtml: string) =>
  new JSDOM(`<!doctype html><body>${bodyHtml}</body>`, {
    url: "https://github.com/acme/widgets",
  }).window

const fixtureProvider = (
  win: NavigationWindow,
  observedRoot: () => Element | null = () => win.document.body
): Provider => ({
  id: "github",
  matches: () => true,
  rows: function* (root): Generator<Row> {
    for (const el of root.querySelectorAll("[data-name]")) {
      yield {
        kind: "file",
        name: el.getAttribute("data-name") ?? "",
        iconTarget: el,
      }
    }
  },
  observedRoot,
})

describe("watchProvider", () => {
  test("applies icons immediately on attach", () => {
    const win = makeWindow('<span data-name="a.rs"></span>')
    const provider = fixtureProvider(win)
    watchProvider(provider, DEFAULT_SETTINGS, (f) => `icon:${f}`, win)
    expect(win.document.querySelectorAll("img").length).toBe(1)
  })

  test("re-applies after a DOM mutation inside the observed root", async () => {
    const win = makeWindow('<span data-name="a.rs"></span>')
    const provider = fixtureProvider(win)
    watchProvider(provider, DEFAULT_SETTINGS, (f) => `icon:${f}`, win)
    const el = win.document.createElement("span")
    el.setAttribute("data-name", "b.rs")
    win.document.body.appendChild(el)
    await sleep(0)
    expect(win.document.querySelectorAll("img").length).toBe(2)
  })

  test("re-applies after a client-side navigation event", () => {
    const win = makeWindow('<span data-name="a.rs"></span>')
    const provider = fixtureProvider(win)
    let calls = 0
    const countingProvider: Provider = {
      ...provider,
      rows: (root) => {
        calls += 1
        return provider.rows(root)
      },
    }
    watchProvider(countingProvider, DEFAULT_SETTINGS, (f) => `icon:${f}`, win)
    const before = calls
    win.history.pushState({}, "", "/acme/widgets/tree/main/src")
    expect(calls).toBeGreaterThan(before)
  })

  test("re-applies after the observed root itself is replaced wholesale, without a navigation event", async () => {
    const win = makeWindow(
      '<div id="frame"><span data-name="a.rs"></span></div>'
    )
    const provider = fixtureProvider(win, () =>
      win.document.getElementById("frame")
    )
    watchProvider(provider, DEFAULT_SETTINGS, (f) => `icon:${f}`, win)
    await sleep(0)
    expect(win.document.querySelectorAll("img").length).toBe(1)

    const replacement = win.document.createElement("div")
    replacement.id = "frame"
    const span = win.document.createElement("span")
    span.setAttribute("data-name", "b.rs")
    replacement.appendChild(span)
    win.document.getElementById("frame")?.replaceWith(replacement)

    await sleep(0)
    expect(win.document.querySelectorAll("img").length).toBe(1)
  })

  test("refresh applies new settings without waiting for a mutation", () => {
    const win = makeWindow('<span data-name="a.rs"></span>')
    const provider = fixtureProvider(win)
    const handle = watchProvider(
      provider,
      DEFAULT_SETTINGS,
      (f) => `icon:${f}`,
      win
    )
    expect(win.document.querySelectorAll("img").length).toBe(1)
    handle.refresh({
      ...DEFAULT_SETTINGS,
      siteEnabled: { ...DEFAULT_SETTINGS.siteEnabled, github: false },
    })
    expect(win.document.querySelectorAll("img").length).toBe(0)
  })

  test("stop halts both mutation and navigation reactivity", async () => {
    const win = makeWindow('<span data-name="a.rs"></span>')
    const provider = fixtureProvider(win)
    const handle = watchProvider(
      provider,
      DEFAULT_SETTINGS,
      (f) => `icon:${f}`,
      win
    )
    handle.stop()
    const el = win.document.createElement("span")
    el.setAttribute("data-name", "b.rs")
    win.document.body.appendChild(el)
    await sleep(0)
    expect(win.document.querySelectorAll("img").length).toBe(1)
  })
})
