import { describe, expect, test } from "bun:test"

import type { IconManifest } from "../generate/types.ts"
import { iconFilenameFor, resolveIconKey } from "./mappings.ts"
import { DEFAULT_SETTINGS } from "./settings.ts"

const manifest: IconManifest = {
  fileExtensionIcon: { rs: "rust", md: "markdown" },
  fileNameIcon: { dockerfile: "docker" },
  folderNameIcon: { src: "folder-src" },
  folderNameExpandedIcon: { src: "folder-src-open" },
  rootFolderNameIcon: {},
  rootFolderNameExpandedIcon: {},
  defaultFileIcon: "file",
  defaultFolderIcon: "folder",
  defaultFolderExpandedIcon: "folder-open",
  packs: {
    react: {
      folderNameIcon: { components: "folder-components" },
      fileExtensionIcon: { jsx: "react" },
    },
  },
  icons: {
    rust: "rust.svg",
    markdown: "markdown.svg",
    docker: "docker.svg",
    "folder-src": "folder-src.svg",
    "folder-src-open": "folder-src-open.svg",
    "folder-components": "folder-components.svg",
    react: "react.svg",
    file: "file.svg",
    folder: "folder.svg",
    "folder-open": "folder-open.svg",
  },
}

const row = (
  overrides: Partial<{
    kind: "file" | "folder" | "submodule" | "symlink"
    name: string
    folderState: "open" | "closed"
  }>
) => ({ kind: "file" as const, name: "x", ...overrides })

describe("resolveIconKey", () => {
  test("resolves a file by extension", () => {
    expect(
      resolveIconKey(row({ name: "main.rs" }), DEFAULT_SETTINGS, manifest)
    ).toBe("rust")
  })

  test("resolves a file by exact filename before extension", () => {
    expect(
      resolveIconKey(row({ name: "Dockerfile" }), DEFAULT_SETTINGS, manifest)
    ).toBe("docker")
  })

  test("falls back to the default file icon for an unknown extension", () => {
    expect(
      resolveIconKey(row({ name: "x.unknownext" }), DEFAULT_SETTINGS, manifest)
    ).toBe("file")
  })

  test("resolves a closed folder to the closed folder table", () => {
    expect(
      resolveIconKey(
        row({ kind: "folder", name: "src", folderState: "closed" }),
        DEFAULT_SETTINGS,
        manifest
      )
    ).toBe("folder-src")
  })

  test("resolves an open folder to the expanded folder table", () => {
    expect(
      resolveIconKey(
        row({ kind: "folder", name: "src", folderState: "open" }),
        DEFAULT_SETTINGS,
        manifest
      )
    ).toBe("folder-src-open")
  })

  test("falls back to the default folder icon for an unknown folder name", () => {
    expect(
      resolveIconKey(
        row({ kind: "folder", name: "mystery" }),
        DEFAULT_SETTINGS,
        manifest
      )
    ).toBe("folder")
  })

  test("applies the active icon pack's file extension override", () => {
    const settings = { ...DEFAULT_SETTINGS, iconPack: "react" }
    expect(resolveIconKey(row({ name: "app.jsx" }), settings, manifest)).toBe(
      "react"
    )
  })

  test("applies the active icon pack's folder override", () => {
    const settings = { ...DEFAULT_SETTINGS, iconPack: "react" }
    expect(
      resolveIconKey(
        row({ kind: "folder", name: "components" }),
        settings,
        manifest
      )
    ).toBe("folder-components")
  })

  test("a custom mapping wins over the generated table", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      customExtensions: { rs: "markdown" },
    }
    expect(resolveIconKey(row({ name: "main.rs" }), settings, manifest)).toBe(
      "markdown"
    )
  })

  test("a custom mapping pointing at an unknown icon key is ignored, not thrown", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      customExtensions: { rs: "does-not-exist" },
    }
    expect(() =>
      resolveIconKey(row({ name: "main.rs" }), settings, manifest)
    ).not.toThrow()
    expect(resolveIconKey(row({ name: "main.rs" }), settings, manifest)).toBe(
      "rust"
    )
  })

  test("submodule and symlink rows resolve through the file table", () => {
    expect(
      resolveIconKey(
        row({ kind: "submodule", name: "vendor" }),
        DEFAULT_SETTINGS,
        manifest
      )
    ).toBe("file")
    expect(
      resolveIconKey(
        row({ kind: "symlink", name: "cur.rs" }),
        DEFAULT_SETTINGS,
        manifest
      )
    ).toBe("rust")
  })
})

describe("iconFilenameFor", () => {
  test("resolves the icon key to its generated SVG filename", () => {
    expect(
      iconFilenameFor(row({ name: "main.rs" }), DEFAULT_SETTINGS, manifest)
    ).toBe("rust.svg")
  })

  test("falls back to the default file SVG when nothing resolves", () => {
    const empty: IconManifest = { ...manifest, icons: { file: "file.svg" } }
    expect(
      iconFilenameFor(row({ name: "main.rs" }), DEFAULT_SETTINGS, empty)
    ).toBe("file.svg")
  })

  test("throws when the default file icon is also missing", () => {
    const empty: IconManifest = { ...manifest, icons: {} }
    expect(() =>
      iconFilenameFor(row({ name: "main.rs" }), DEFAULT_SETTINGS, empty)
    ).toThrow("missing icon for file")
  })
})

describe("inherited Object.prototype keys", () => {
  test.each(["constructor", "toString", "__proto__", "valueOf"])(
    "a stored mapping to %p resolves to the default icon",
    (name) => {
      const settings = {
        ...DEFAULT_SETTINGS,
        customExtensions: { rs: name },
        customFileNames: { "main.rs": name },
      }
      expect(resolveIconKey(row({ name: "main.rs" }), settings, manifest)).toBe(
        "rust"
      )
      expect(iconFilenameFor(row({ name }), DEFAULT_SETTINGS, manifest)).toBe(
        "file.svg"
      )
    }
  )
})
