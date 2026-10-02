import { describe, expect, test } from "bun:test"
import { JSDOM } from "jsdom"

import { GITEE_LISTING } from "../../tests/fixtures/gitee.ts"
import { gitee } from "./gitee.ts"

const rootFrom = (html: string) => new JSDOM(html).window.document

describe("gitee provider", () => {
  test("matches only gitee.com", () => {
    expect(gitee.matches(new URL("https://gitee.com/acme/widgets"))).toBe(true)
    expect(gitee.matches(new URL("https://gitea.com/acme/widgets"))).toBe(false)
  })

  test("classifies every row kind from the iconfont class", () => {
    const rows = [...gitee.rows(rootFrom(GITEE_LISTING))]
    const byName = Object.fromEntries(rows.map((r) => [r.name, r.kind]))
    expect(byName["src"]).toBe("folder")
    expect(byName["README.md"]).toBe("file")
    expect(byName["vendor/lib"]).toBe("submodule")
    expect(byName["current"]).toBe("symlink")
  })
})
