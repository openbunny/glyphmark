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

describe("release workflow", () => {
  const release = read("release.yml")

  test("runs only for version tags", () => {
    expect(release).toMatch(/on:\n {2}push:\n {4}tags: \["v\*"\]\n/)
    expect(release).not.toContain("pull_request")
  })

  test("the signing job runs in the release environment after the tag check", () => {
    const job = release.slice(release.indexOf("  sign-notarize-publish:"))
    expect(job).toContain("needs: [tag-version]")
    expect(job).toContain("environment: release")
  })

  test("the signing job fails with a named message when a secret is missing", () => {
    expect(release).toContain("Release secrets missing")
    for (const name of [
      "DEVELOPER_ID_CERTIFICATE_P12",
      "DEVELOPER_ID_CERTIFICATE_PASSWORD",
      "DEVELOPMENT_TEAM",
      "NOTARY_API_KEY_P8",
      "NOTARY_API_KEY_ID",
      "NOTARY_API_ISSUER_ID",
    ])
      expect(release).toContain(`secrets.${name}`)
  })

  test("signs with Developer ID, notarizes, staples and cleans up", () => {
    for (const command of [
      "Developer ID Application",
      "xcrun notarytool submit",
      "xcrun stapler staple",
      "xcrun stapler validate",
      "security delete-keychain",
    ])
      expect(release).toContain(command)
    expect(release).toMatch(
      /- name: Remove signing material\n\s+if: always\(\)/
    )
  })

  test("no job outside the signing job reads a secret", () => {
    const beforeSigning = release.slice(
      0,
      release.indexOf("  sign-notarize-publish:")
    )
    expect(beforeSigning).not.toContain("secrets.")
  })
})
