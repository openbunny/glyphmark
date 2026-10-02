import { describe, expect, test } from "bun:test"
import { JSDOM } from "jsdom"

import { AZURE_DEVOPS_TREE } from "../../tests/fixtures/azureDevops.ts"
import { azureDevops } from "./azureDevops.ts"

const rootFrom = (html: string) => new JSDOM(html).window.document

describe("azureDevops provider", () => {
  test("matches dev.azure.com and *.visualstudio.com", () => {
    expect(
      azureDevops.matches(new URL("https://dev.azure.com/acme/widgets"))
    ).toBe(true)
    expect(
      azureDevops.matches(new URL("https://acme.visualstudio.com/widgets"))
    ).toBe(true)
    expect(azureDevops.matches(new URL("https://example.com/widgets"))).toBe(
      false
    )
  })

  test("reports folder state for open and closed folders", () => {
    const rows = [...azureDevops.rows(rootFrom(AZURE_DEVOPS_TREE))]
    const byName = Object.fromEntries(rows.map((r) => [r.name, r]))
    expect(byName["src"]?.kind).toBe("folder")
    expect(byName["src"]?.folderState).toBe("open")
    expect(byName["dist"]?.kind).toBe("folder")
    expect(byName["dist"]?.folderState).toBe("closed")
  })

  test("a file row carries no folder state", () => {
    const rows = [...azureDevops.rows(rootFrom(AZURE_DEVOPS_TREE))]
    const readme = rows.find((r) => r.name === "README.md")
    expect(readme?.kind).toBe("file")
    expect(readme?.folderState).toBeUndefined()
  })

  test("classifies submodules and symlinks from the item-type attribute", () => {
    const rows = [...azureDevops.rows(rootFrom(AZURE_DEVOPS_TREE))]
    const byName = Object.fromEntries(rows.map((r) => [r.name, r.kind]))
    expect(byName["vendor/lib"]).toBe("submodule")
    expect(byName["current"]).toBe("symlink")
  })
})
