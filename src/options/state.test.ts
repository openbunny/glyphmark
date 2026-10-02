import { describe, expect, test } from "bun:test"

import { PROVIDER_IDS } from "../shared/provider.ts"
import { DEFAULT_SETTINGS } from "../shared/settings.ts"
import {
  iconKeyExists,
  PROVIDER_LABELS,
  removeMappingEntry,
  resetToDefaults,
  setGlobalEnabled,
  setIconPack,
  setIconSize,
  setMappingEntry,
  setSiteEnabled,
} from "./state.ts"

describe("PROVIDER_LABELS", () => {
  test("has exactly one label per provider id", () => {
    expect(Object.keys(PROVIDER_LABELS).sort()).toEqual(
      [...PROVIDER_IDS].sort()
    )
  })

  test("every label is at most two words, per the field-label limit", () => {
    for (const label of Object.values(PROVIDER_LABELS)) {
      expect(label.trim().split(/\s+/).length).toBeLessThanOrEqual(2)
    }
  })
})

describe("setGlobalEnabled / setSiteEnabled", () => {
  test("toggles the global flag without touching per-site state", () => {
    const next = setGlobalEnabled(DEFAULT_SETTINGS, false)
    expect(next.enabled).toBe(false)
    expect(next.siteEnabled).toEqual(DEFAULT_SETTINGS.siteEnabled)
  })

  test("toggles exactly one site without touching the others", () => {
    const next = setSiteEnabled(DEFAULT_SETTINGS, "github", false)
    expect(next.siteEnabled.github).toBe(false)
    expect(next.siteEnabled.gitlab).toBe(true)
  })
})

describe("setIconSize / setIconPack", () => {
  test("updates the icon size", () => {
    expect(setIconSize(DEFAULT_SETTINGS, "large").iconSize).toBe("large")
  })

  test("updates the icon pack", () => {
    expect(setIconPack(DEFAULT_SETTINGS, "react").iconPack).toBe("react")
  })
})

describe("mapping entries", () => {
  test("setMappingEntry adds a new custom extension mapping", () => {
    const next = setMappingEntry(
      DEFAULT_SETTINGS,
      "customExtensions",
      "rs",
      "rust"
    )
    expect(next.customExtensions).toEqual({ rs: "rust" })
  })

  test("setMappingEntry overwrites an existing key", () => {
    const withOne = setMappingEntry(
      DEFAULT_SETTINGS,
      "customExtensions",
      "rs",
      "rust"
    )
    const next = setMappingEntry(withOne, "customExtensions", "rs", "toml")
    expect(next.customExtensions).toEqual({ rs: "toml" })
  })

  test("removeMappingEntry deletes exactly the named key", () => {
    const withTwo = setMappingEntry(
      setMappingEntry(DEFAULT_SETTINGS, "customExtensions", "rs", "rust"),
      "customExtensions",
      "md",
      "markdown"
    )
    const next = removeMappingEntry(withTwo, "customExtensions", "rs")
    expect(next.customExtensions).toEqual({ md: "markdown" })
  })

  test("removing a key that is not present is a no-op", () => {
    const next = removeMappingEntry(
      DEFAULT_SETTINGS,
      "customExtensions",
      "missing"
    )
    expect(next.customExtensions).toEqual({})
  })
})

describe("iconKeyExists", () => {
  test("is true for a real generated icon key", () => {
    expect(iconKeyExists("file")).toBe(true)
  })

  test("is false for an unknown key", () => {
    expect(iconKeyExists("not-a-real-icon-key")).toBe(false)
  })
})

describe("resetToDefaults", () => {
  test("returns the default settings object", () => {
    expect(resetToDefaults()).toEqual(DEFAULT_SETTINGS)
  })
})
