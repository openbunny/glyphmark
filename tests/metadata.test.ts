import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, test } from "bun:test"
import { JSDOM } from "jsdom"

import manifest from "../Resources/manifest.json"
import pkg from "../package.json"

const root = join(import.meta.dirname, "..")
const read = (path: string) => readFileSync(join(root, path), "utf8")

describe("release metadata", () => {
  test("the manifest version equals the package version", () => {
    expect(manifest.version).toBe(pkg.version)
  })

  test("MARKETING_VERSION in project.yml equals the package version", () => {
    const match = /^\s*MARKETING_VERSION:\s*(\S+)/m.exec(read("project.yml"))
    expect(match?.[1]).toBe(pkg.version)
  })

  test("both Info.plists take their version from build settings", () => {
    for (const path of ["App/Info.plist", "Extension/Info.plist"]) {
      const plist = read(path)
      expect(plist).toContain("<string>$(MARKETING_VERSION)</string>")
      expect(plist).toContain("<string>$(CURRENT_PROJECT_VERSION)</string>")
    }
  })

  test("the package licence is the licence in LICENSE", () => {
    expect(pkg.license).toBe("MIT")
    expect(read("LICENSE")).toStartWith("MIT License")
  })
})

describe("page titles", () => {
  test.each([
    ["popup.html", manifest.name],
    ["options.html", `${manifest.name} settings`],
  ])("%s is titled %p", (file, title) => {
    const doc = new JSDOM(read(`Resources/${file}`)).window.document
    expect(doc.title).toBe(title)
  })
})

describe("third-party notices", () => {
  test("the Material Icon Theme licence ships in the extension bundle", () => {
    const path = join(
      root,
      "Resources/generated/material-icon-theme-LICENSE.txt"
    )
    expect(existsSync(path)).toBe(true)
    expect(readFileSync(path, "utf8")).toContain("MIT License")
  })

  test("NOTICE names every bundled third-party package", () => {
    const notice = read("NOTICE")
    for (const name of [
      "material-icon-theme",
      "zod",
      "@openbunny/theme",
      "Courier Prime",
      "JetBrains Mono",
      "SIL Open Font License",
    ]) {
      expect(notice).toContain(name)
    }
  })
})
