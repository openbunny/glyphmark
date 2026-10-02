import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { contrastRatio, thresholds } from "@openbunny/theme/contrast"
import { describe, expect, test } from "bun:test"
import { JSDOM } from "jsdom"

import { resolveToken } from "./color.ts"

const resourcesDir = join(import.meta.dirname, "..", "Resources")
const resources = (name: string) =>
  readFileSync(join(resourcesDir, name), "utf8")

describe.each([["options.html"], ["popup.html"]])("%s", (file) => {
  const doc = new JSDOM(resources(file)).window.document

  test("declares a language on the root element", () => {
    expect(doc.documentElement.getAttribute("lang")).toBe("en")
  })

  test("has exactly one h1", () => {
    expect(doc.querySelectorAll("h1").length).toBe(1)
  })

  test("every input and select has an associated label, explicit or wrapping", () => {
    const controls = doc.querySelectorAll("input, select")
    for (const control of controls) {
      const id = control.getAttribute("id")
      const explicit = id ? doc.querySelector(`label[for="${id}"]`) : null
      const wrapping = control.closest("label")
      expect(
        explicit ?? wrapping,
        `control ${control.outerHTML} has no label`
      ).not.toBeNull()
    }
  })

  test("no positive tabindex overrides the natural tab order", () => {
    for (const el of doc.querySelectorAll("[tabindex]")) {
      const value = Number(el.getAttribute("tabindex"))
      expect(value).toBeLessThanOrEqual(0)
    }
  })

  test("no autoplaying media or marquee-style motion", () => {
    expect(doc.querySelectorAll("marquee, blink, [autoplay]").length).toBe(0)
  })
})

describe("control-length limits in the shipped UI", () => {
  const doc = new JSDOM(resources("options.html")).window.document
  const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

  test("every button is at most two words", () => {
    for (const button of doc.querySelectorAll("button")) {
      expect(words(button.textContent ?? "")).toBeLessThanOrEqual(2)
    }
  })

  test("every field label is at most two words", () => {
    for (const label of doc.querySelectorAll("label:not(.visually-hidden)")) {
      const text = (label.textContent ?? "").replace(/\s+/g, " ").trim()
      expect(words(text)).toBeLessThanOrEqual(2)
    }
  })

  test("no label ends in a full stop on a fragment", () => {
    for (const label of doc.querySelectorAll("label, h1, h2, h3, legend")) {
      expect((label.textContent ?? "").trim().endsWith(".")).toBe(false)
    }
  })

  test("the footer is a fragment without a trailing colon or stop", () => {
    const footer = doc.querySelector("footer p")
    if (!footer) throw new Error("options.html has no footer")
    const text = (footer.textContent ?? "").replace(/\s+/g, " ").trim()
    expect(text.endsWith(".")).toBe(false)
    expect(text.includes(":")).toBe(false)
  })
})

describe("light palette contrast (WCAG 2.2 AA)", () => {
  const body: readonly (readonly [string, string, string])[] = [
    ["body text on the page", "foreground", "background"],
    ["button text on its fill", "primary-foreground", "primary"],
    ["button text on its hover fill", "primary-foreground", "ink"],
    ["muted text on the page", "muted-foreground", "background"],
    ["field text on the field fill", "foreground", "input"],
    ["list text on the card fill", "foreground", "card"],
    ["error text on the page", "destructive", "background"],
  ]
  test.each(body)("%s clears 4.5:1", (_name, foreground, background) => {
    expect(
      contrastRatio(resolveToken(foreground), resolveToken(background))
    ).toBeGreaterThanOrEqual(thresholds.body)
  })

  const outlines: readonly (readonly [string, string, string])[] = [
    ["focus ring on the page", "ring", "background"],
    ["border on the page", "border", "background"],
  ]
  test.each(outlines)("%s clears 3:1", (_name, foreground, background) => {
    expect(
      contrastRatio(resolveToken(foreground), resolveToken(background))
    ).toBeGreaterThanOrEqual(thresholds.large)
  })
})

describe("shipped styles take every theme value from the theme package", () => {
  const styles = readdirSync(resourcesDir).filter((f) => f.endsWith(".css"))
  const generated = join(resourcesDir, "generated", "theme")

  test("the target set is not empty", () => {
    expect(styles.length).toBeGreaterThan(0)
  })

  test.each(styles)(
    "%s has no colour literal, font stack or radius",
    (file) => {
      const css = resources(file)
      expect(css).not.toMatch(
        /#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab)\(/i
      )
      expect(css).not.toMatch(/font-family\s*:/)
      expect(css).not.toMatch(/border-radius\s*:\s*(?!0\b)/)
    }
  )

  test.each(["popup.html", "options.html"])(
    "%s links the theme styles in dependency order",
    (file) => {
      const hrefs = [
        ...new JSDOM(resources(file)).window.document.querySelectorAll(
          'link[rel="stylesheet"]'
        ),
      ].map((link) => link.getAttribute("href"))
      expect(hrefs).toEqual([
        "generated/theme/css/tokens.css",
        "generated/theme/css/extension-aliases.css",
        "generated/theme/css/fonts.css",
        "generated/theme/css/extension-base.css",
        file.replace(".html", ".css"),
      ])
    }
  )

  test("every linked stylesheet and font file exists in the built Resources", () => {
    const urls = [
      ...readFileSync(join(generated, "css", "fonts.css"), "utf8").matchAll(
        /url\("([^"]+)"\)/g
      ),
    ].map((match) => match[1])
    expect(urls.length).toBeGreaterThan(0)
    for (const url of urls) {
      expect(existsSync(join(generated, "css", url ?? "")), `${url}`).toBe(true)
    }
    for (const file of ["extension-aliases", "extension-base"]) {
      expect(existsSync(join(generated, "css", `${file}.css`))).toBe(true)
    }
  })

  test("the font licences ship beside the fonts", () => {
    expect(existsSync(join(generated, "fonts", "OFL-CourierPrime.txt"))).toBe(
      true
    )
    expect(existsSync(join(generated, "fonts", "OFL-JetBrainsMono.txt"))).toBe(
      true
    )
  })

  test("corners resolve to zero", () => {
    expect(resolveToken("radius")).toBe("0px")
  })

  test("the page is light only", () => {
    expect(
      readFileSync(join(generated, "css", "tokens.css"), "utf8")
    ).toContain("color-scheme: light;")
    for (const file of styles)
      expect(resources(file)).not.toContain("prefers-color-scheme")
  })
})
