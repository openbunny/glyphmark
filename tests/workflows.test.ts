import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, test } from "bun:test"

const read = (name: string): string =>
  readFileSync(
    join(import.meta.dirname, "..", ".github/workflows", name),
    "utf8"
  )

describe("unsigned CI", () => {
  const ci = read("ci.yml")

  test("runs on pull_request and builds with signing disabled", () => {
    expect(ci).toMatch(/^ {2}pull_request:/m)
    expect(ci).toContain("reusable-check.yml@")
    expect(
      readFileSync(join(import.meta.dirname, "..", "justfile"), "utf8")
    ).toContain("CODE_SIGNING_ALLOWED=NO")
  })

  test("references no secret and no environment", () => {
    expect(ci).not.toContain("secrets.")
    expect(ci).not.toMatch(/^\s*environment:/m)
    expect(ci).not.toContain("secrets: inherit")
  })

  test("never uses pull_request_target", () => {
    expect(ci).not.toContain("pull_request_target")
  })
})
