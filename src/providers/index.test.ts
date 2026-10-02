import { describe, expect, test } from "bun:test"

import { PROVIDER_IDS } from "../shared/provider.ts"
import { PROVIDERS, providerFor } from "./index.ts"

describe("PROVIDERS registry", () => {
  test("has exactly one provider per declared provider id, no more, no fewer", () => {
    expect(PROVIDERS.map((p) => p.id).sort()).toEqual([...PROVIDER_IDS].sort())
  })

  test("no two providers claim the same host", () => {
    const urls = [
      "https://github.com/a/b",
      "https://bitbucket.org/a/b",
      "https://dev.azure.com/a/b",
      "https://acme.visualstudio.com/b",
      "https://gitlab.com/a/b",
      "https://gitea.com/a/b",
      "https://gitee.com/a/b",
      "https://sourceforge.net/p/a",
      "https://codeberg.org/a/b",
      "https://tangled.org/@a/b",
      "https://salsa.debian.org/debian/hello/-/tree/master",
    ]
    for (const raw of urls) {
      const url = new URL(raw)
      const matches = PROVIDERS.filter((p) => p.matches(url))
      expect(matches.length).toBe(1)
    }
  })

  test("providerFor returns undefined for an unsupported host", () => {
    expect(providerFor(new URL("https://example.com/a/b"))).toBeUndefined()
  })

  test("providerFor picks the matching provider", () => {
    expect(providerFor(new URL("https://github.com/a/b"))?.id).toBe("github")
    expect(providerFor(new URL("https://salsa.debian.org/a/b"))?.id).toBe(
      "gitlab"
    )
    expect(providerFor(new URL("https://codeberg.org/a/b"))?.id).toBe("forgejo")
    expect(providerFor(new URL("https://gitea.com/a/b"))?.id).toBe("gitea")
    expect(providerFor(new URL("https://bitbucket.org/a/b"))?.id).toBe(
      "bitbucket"
    )
  })

  test("no provider matches over plain HTTP", () => {
    const httpUrls = [
      "http://github.com/a/b",
      "http://bitbucket.org/a/b",
      "http://gitlab.com/a/b",
    ]
    for (const raw of httpUrls) {
      const url = new URL(raw)
      expect(PROVIDERS.some((p) => p.matches(url))).toBe(false)
    }
  })
})
