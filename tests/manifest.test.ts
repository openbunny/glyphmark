import { describe, expect, test } from "bun:test"

import manifest from "../Resources/manifest.json"

const EXPECTED_HOSTS = [
  "https://github.com/*",
  "https://bitbucket.org/*",
  "https://dev.azure.com/*",
  "https://*.visualstudio.com/*",
  "https://gitlab.com/*",
  "https://salsa.debian.org/*",
  "https://gitlab.gnome.org/*",
  "https://invent.kde.org/*",
  "https://gitlab.freedesktop.org/*",
  "https://git.drupalcode.org/*",
  "https://gitlab.archlinux.org/*",
  "https://gitlab.torproject.org/*",
  "https://framagit.org/*",
  "https://code.videolan.org/*",
  "https://gitea.com/*",
  "https://gitee.com/*",
  "https://sourceforge.net/*",
  "https://codeberg.org/*",
  "https://tangled.org/*",
]

describe("manifest.json", () => {
  test("is a manifest v3", () => {
    expect(manifest.manifest_version).toBe(3)
  })

  test("permissions are exactly storage, nothing else", () => {
    expect(manifest.permissions).toEqual(["storage"])
  })

  test("host_permissions are exactly the listed forge hosts, no more, no fewer", () => {
    expect([...manifest.host_permissions].sort()).toEqual(
      [...EXPECTED_HOSTS].sort()
    )
  })

  test("every host permission is HTTPS only", () => {
    for (const pattern of manifest.host_permissions) {
      expect(pattern.startsWith("https://")).toBe(true)
    }
  })

  test("no wildcard scheme or all-URLs permission is present", () => {
    const forbidden = ["<all_urls>", "*://*/*", "http://*/*", "*://*.*"]
    for (const pattern of manifest.host_permissions) {
      expect(forbidden).not.toContain(pattern)
    }
  })

  test("content scripts are statically registered, not runtime-registered", () => {
    expect(Array.isArray(manifest.content_scripts)).toBe(true)
    expect(manifest.content_scripts.length).toBeGreaterThan(0)
  })

  test("the content script's match patterns equal the host permissions exactly", () => {
    const scriptMatches = manifest.content_scripts.flatMap((s) => s.matches)
    expect([...scriptMatches].sort()).toEqual([...EXPECTED_HOSTS].sort())
  })

  test("the content script does not run in subframes", () => {
    for (const script of manifest.content_scripts) {
      expect(script.all_frames).toBe(false)
    }
  })

  test("no activeTab, tabs, scripting, or nativeMessaging permission is present", () => {
    const forbidden = [
      "activeTab",
      "tabs",
      "scripting",
      "nativeMessaging",
      "webRequest",
    ]
    for (const permission of forbidden) {
      expect(manifest.permissions).not.toContain(permission)
    }
  })

  test("the CSP is local-only: no remote scheme, no unsafe-inline, no unsafe-eval", () => {
    const csp = manifest.content_security_policy.extension_pages
    expect(csp).not.toMatch(/https?:/)
    expect(csp).not.toMatch(/unsafe-inline/)
    expect(csp).not.toMatch(/unsafe-eval/)
    expect(csp).toMatch(/script-src 'self'/)
  })

  test("no web-accessible resource exposes a per-install extension URL to a page", () => {
    expect("web_accessible_resources" in manifest).toBe(false)
  })
})
