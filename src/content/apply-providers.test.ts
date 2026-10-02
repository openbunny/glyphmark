import { describe, expect, test } from "bun:test"
import { JSDOM } from "jsdom"

import { GITHUB_LISTING } from "../../tests/fixtures/github.ts"
import { GITLAB_LISTING } from "../../tests/fixtures/gitlab.ts"
import { github } from "../providers/github.ts"
import { gitlab } from "../providers/gitlab.ts"
import { DEFAULT_SETTINGS } from "../shared/settings.ts"
import { applyProviderIcons } from "./apply.ts"

describe("applyProviderIcons against real providers and captured listings", () => {
  test("paints one icon per github.rows() row on the real GitHub listing fixture", () => {
    const doc = new JSDOM(GITHUB_LISTING).window.document
    const rowCount = [...github.rows(doc)].length
    applyProviderIcons(github, doc, DEFAULT_SETTINGS, (f) => `icon:${f}`)
    expect(doc.querySelectorAll("img").length).toBe(rowCount)
    expect(rowCount).toBe(8)
  })

  test("paints one icon per gitlab.rows() row on the real GitLab listing fixture", () => {
    const doc = new JSDOM(GITLAB_LISTING).window.document
    const rowCount = [...gitlab.rows(doc)].length
    applyProviderIcons(gitlab, doc, DEFAULT_SETTINGS, (f) => `icon:${f}`)
    expect(doc.querySelectorAll("img").length).toBe(rowCount)
    expect(rowCount).toBeGreaterThan(0)
  })
})
