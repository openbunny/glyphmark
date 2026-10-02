import { describe, expect, test } from "bun:test"

import { PROVIDER_IDS } from "./provider.ts"
import { DEFAULT_SETTINGS, isSiteEnabled, parseSettings } from "./settings.ts"

const parseJson = (text: string): unknown => JSON.parse(text)

describe("parseSettings", () => {
  test("returns defaults for undefined, null, and non-object input", () => {
    expect(parseSettings(undefined)).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings("not an object")).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings(42)).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings([1, 2, 3])).toEqual(DEFAULT_SETTINGS)
  })

  test("round-trips a fully valid settings object", () => {
    const valid = {
      enabled: false,
      siteEnabled: { github: false, gitlab: true },
      iconSize: "large",
      iconPack: "react",
      customFileNames: { "package.json": "npm" },
      customExtensions: { rs: "rust" },
      customFolderNames: { src: "folder-src" },
    }
    const parsed = parseSettings(valid)
    expect(parsed.enabled).toBe(false)
    expect(parsed.siteEnabled.github).toBe(false)
    expect(parsed.siteEnabled.gitlab).toBe(true)
    expect(parsed.iconSize).toBe("large")
    expect(parsed.iconPack).toBe("react")
    expect(parsed.customFileNames).toEqual({ "package.json": "npm" })
    expect(parsed.customExtensions).toEqual({ rs: "rust" })
    expect(parsed.customFolderNames).toEqual({ src: "folder-src" })
  })

  test("falls back per field: one corrupt field does not reset the rest", () => {
    const partiallyCorrupt = {
      enabled: "yes",
      iconSize: "huge",
      iconPack: "react",
      customFileNames: { "package.json": "npm" },
    }
    const parsed = parseSettings(partiallyCorrupt)
    expect(parsed.enabled).toBe(DEFAULT_SETTINGS.enabled)
    expect(parsed.iconSize).toBe(DEFAULT_SETTINGS.iconSize)
    expect(parsed.iconPack).toBe("react")
    expect(parsed.customFileNames).toEqual({ "package.json": "npm" })
  })

  test("drops unknown provider ids and coerces bad booleans in siteEnabled", () => {
    const parsed = parseSettings({
      siteEnabled: { github: false, notAProvider: true, gitlab: "nope" },
    })
    expect(parsed.siteEnabled.github).toBe(false)
    expect(parsed.siteEnabled.gitlab).toBe(DEFAULT_SETTINGS.siteEnabled.gitlab)
    expect(Object.keys(parsed.siteEnabled).sort()).toEqual(
      [...PROVIDER_IDS].sort()
    )
  })

  test("drops mapping entries with invalid keys, values, or types", () => {
    const parsed = parseSettings({
      customExtensions: {
        rs: "rust",
        "": "empty-key",
        good: 42,
        [String("x").repeat(200)]: "too-long-key",
        toolong: String("y").repeat(200),
      },
    })
    expect(parsed.customExtensions).toEqual({ rs: "rust" })
  })

  test.each(["constructor", "toString", "__proto__", "prototype"])(
    "rejects the reserved name %p as a mapping key and as a mapping value",
    (name) => {
      const parsed = parseSettings({
        customExtensions: parseJson(
          `{ ${JSON.stringify(name)}: "rust", "rs": ${JSON.stringify(name)}, "md": "markdown" }`
        ),
      })
      expect(parsed.customExtensions).toEqual({ md: "markdown" })
    }
  )

  test("caps mapping size rather than accepting unbounded storage", () => {
    const huge = Object.fromEntries(
      Array.from({ length: 1000 }, (_, i) => [`ext${i}`, `icon${i}`])
    )
    const parsed = parseSettings({ customExtensions: huge })
    expect(Object.keys(parsed.customExtensions).length).toBeLessThanOrEqual(500)
  })

  test("never throws on any input", () => {
    const inputs: unknown[] = [
      undefined,
      null,
      0,
      "",
      [],
      {},
      { siteEnabled: null },
      { customFileNames: "not a record" },
      { customFileNames: [1, 2, 3] },
      Symbol("weird"),
      Math.random,
    ]
    for (const input of inputs) expect(() => parseSettings(input)).not.toThrow()
  })
})

describe("isSiteEnabled", () => {
  test("is false when globally disabled even if the site is enabled", () => {
    const settings = { ...DEFAULT_SETTINGS, enabled: false }
    expect(isSiteEnabled(settings, "github")).toBe(false)
  })

  test("is false when the site itself is disabled", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      siteEnabled: { ...DEFAULT_SETTINGS.siteEnabled, github: false },
    }
    expect(isSiteEnabled(settings, "github")).toBe(false)
  })

  test("is true when both global and per-site are enabled", () => {
    expect(isSiteEnabled(DEFAULT_SETTINGS, "github")).toBe(true)
  })
})
