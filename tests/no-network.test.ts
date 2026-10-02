import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, test } from "bun:test"

const RUNTIME_DIRS = ["content", "options", "popup", "providers", "shared"]
const FORBIDDEN = [
  /\bfetch\s*\(/,
  /XMLHttpRequest/,
  /\bWebSocket\s*\(/,
  /\beval\s*\(/,
  /new Function\(/,
  /\bEventSource\b/,
  /\bsendBeacon\b/,
  /\bsendNativeMessage\b/,
  /\.sendMessage\s*\(/,
  /\bimport\s*\(/,
  /\bnew Image\b/,
  /\bwindow\.open\s*\(/,
]

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return entry.name === "generated" ? [] : walk(path)
    return path.endsWith(".ts") && !path.endsWith(".test.ts") ? [path] : []
  })

describe("no network request or dynamic code at runtime", () => {
  const root = join(import.meta.dirname, "..", "src")
  const files = RUNTIME_DIRS.flatMap((dir) => walk(join(root, dir)))

  test("scans a non-empty set of runtime source files", () => {
    expect(files.length).toBeGreaterThan(0)
  })

  test.each(FORBIDDEN.map((pattern) => [pattern.source] as const))(
    "no runtime file matches forbidden pattern /%s/",
    (source) => {
      const pattern = new RegExp(source)
      for (const file of files) {
        const content = readFileSync(file, "utf8")
        expect(pattern.test(content), `${file} matches ${source}`).toBe(false)
      }
    }
  )

  test("only the icon renderer assigns an image source", () => {
    const assigning = files.filter((file) =>
      /\.src\s*=(?!=)/.test(readFileSync(file, "utf8"))
    )
    expect(assigning.map((file) => file.slice(root.length + 1))).toEqual([
      join("options", "main.ts"),
      join("shared", "dom.ts"),
    ])
  })

  test("no runtime file references a remote http(s) URL", () => {
    const remote = /https?:\/\/(?!localhost)/
    for (const file of files) {
      const content = readFileSync(file, "utf8")
      expect(remote.test(content), `${file} references a remote URL`).toBe(
        false
      )
    }
  })
})

describe("the bundled content script", () => {
  const bundle = join(import.meta.dirname, "..", "Resources/content/main.js")

  test("exists and is not empty", () => {
    expect(readFileSync(bundle, "utf8").length).toBeGreaterThan(0)
  })

  test.each(FORBIDDEN.map((pattern) => [pattern.source] as const))(
    "does not match forbidden pattern /%s/",
    (source) => {
      expect(new RegExp(source).test(readFileSync(bundle, "utf8"))).toBe(false)
    }
  )
})
