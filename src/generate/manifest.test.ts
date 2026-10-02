import { describe, expect, test } from "bun:test"

import { buildIconManifest } from "./manifest.ts"
import type { MitManifest } from "./types.ts"
import { GenerationError } from "./validate.ts"

const base: MitManifest = {
  iconDefinitions: {
    rust: { iconPath: "./../icons/rust.svg" },
    "folder-rust": { iconPath: "./../icons/folder-rust.svg" },
    "folder-rust-open": { iconPath: "./../icons/folder-rust-open.svg" },
    file: { iconPath: "./../icons/file.svg" },
    folder: { iconPath: "./../icons/folder.svg" },
    "folder-open": { iconPath: "./../icons/folder-open.svg" },
    react: { iconPath: "./../icons/react.svg" },
    "folder-components": { iconPath: "./../icons/folder-components.svg" },
    "folder-react-components": {
      iconPath: "./../icons/folder-react-components.svg",
    },
  },
  fileExtensions: { rs: "rust" },
  fileNames: {},
  folderNames: { rust: "folder-rust", components: "folder-components" },
  folderNamesExpanded: { rust: "folder-rust-open" },
  rootFolderNames: {},
  rootFolderNamesExpanded: {},
  file: "file",
  folder: "folder",
  folderExpanded: "folder-open",
}

describe("buildIconManifest", () => {
  test("derives the base association tables from the upstream manifest", () => {
    const manifest = buildIconManifest(base, {})
    expect(manifest.fileExtensionIcon).toEqual({ rs: "rust" })
    expect(manifest.folderNameIcon).toEqual({
      rust: "folder-rust",
      components: "folder-components",
    })
    expect(manifest.folderNameExpandedIcon).toEqual({
      rust: "folder-rust-open",
    })
    expect(manifest.defaultFileIcon).toBe("file")
    expect(manifest.defaultFolderIcon).toBe("folder")
    expect(manifest.defaultFolderExpandedIcon).toBe("folder-open")
  })

  test("resolves referenced icon keys to their SVG basenames", () => {
    const manifest = buildIconManifest(base, {})
    expect(manifest.icons["rust"]).toBe("rust.svg")
    expect(manifest.icons["folder-rust"]).toBe("folder-rust.svg")
    expect(manifest.icons["file"]).toBe("file.svg")
  })

  test("ships only the SVGs referenced by a table or a default", () => {
    const manifest = buildIconManifest(base, {})
    expect(Object.keys(manifest.icons).sort()).toEqual(
      [
        "file",
        "folder",
        "folder-components",
        "folder-open",
        "folder-rust",
        "folder-rust-open",
        "rust",
      ].sort()
    )
  })

  test("captures a pack override only where it differs from the base", () => {
    const reactVariant: MitManifest = {
      ...base,
      iconDefinitions: {
        ...base.iconDefinitions,
        "folder-react-components": {
          iconPath: "./../icons/folder-react-components.svg",
        },
      },
      folderNames: {
        ...base.folderNames,
        components: "folder-react-components",
      },
    }
    const manifest = buildIconManifest(base, { react: reactVariant })
    expect(manifest.packs["react"]?.folderNameIcon).toEqual({
      components: "folder-react-components",
    })
    expect(manifest.packs["react"]?.fileExtensionIcon).toBeUndefined()
  })

  test("omits a pack entirely when its variant matches the base exactly", () => {
    const manifest = buildIconManifest(base, { react: base })
    expect(manifest.packs["react"]).toBeUndefined()
  })

  test("output is deterministic across repeated runs on the same input", () => {
    const first = buildIconManifest(base, { react: base })
    const second = buildIconManifest(base, { react: base })
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
  })

  test("throws when an association table references an undefined icon key", () => {
    const broken: MitManifest = {
      ...base,
      fileExtensions: { rs: "missing-icon" },
    }
    expect(() => buildIconManifest(broken, {})).toThrow(GenerationError)
  })

  test("throws when the default file icon key is empty", () => {
    const broken: MitManifest = { ...base, file: "" }
    expect(() => buildIconManifest(broken, {})).toThrow(GenerationError)
  })

  test("throws on an icon path that points outside the package", () => {
    const broken: MitManifest = {
      ...base,
      iconDefinitions: {
        ...base.iconDefinitions,
        rust: { iconPath: "https://evil.example/rust.svg" },
      },
    }
    expect(() => buildIconManifest(broken, {})).toThrow(GenerationError)
  })
})
