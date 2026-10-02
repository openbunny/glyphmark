import { describe, expect, test } from "bun:test"

import {
  assertDeterministic,
  assertNoExternalAssetReference,
  assertNoUnreferencedAssets,
  assertReferencedAssetsExist,
  assertValidFilename,
  buildUniqueRecord,
  GenerationError,
} from "./validate.ts"

describe("buildUniqueRecord", () => {
  test("merges pairs with no conflict", () => {
    expect(
      buildUniqueRecord("t", [
        ["a", "1"],
        ["b", "2"],
      ])
    ).toEqual({ a: "1", b: "2" })
  })

  test("tolerates the same key repeating the same value", () => {
    expect(
      buildUniqueRecord("t", [
        ["a", "1"],
        ["a", "1"],
      ])
    ).toEqual({ a: "1" })
  })

  test("throws GenerationError on a duplicate key with conflicting values", () => {
    expect(() =>
      buildUniqueRecord("table", [
        ["a", "1"],
        ["a", "2"],
      ])
    ).toThrow(GenerationError)
  })
})

describe("assertValidFilename", () => {
  test.each([["react.svg"], ["folder-src.svg"], ["a1_b.svg"]])(
    "accepts %s",
    (name) => {
      expect(assertValidFilename(name)).toBe(name)
    }
  )

  test.each([
    ["../escape.svg"],
    ["React.svg"],
    ["react.png"],
    ["react"],
    [".svg"],
    ["react svg"],
  ])("rejects %s", (name) => {
    expect(() => assertValidFilename(name)).toThrow(GenerationError)
  })
})

describe("assertNoExternalAssetReference", () => {
  test("accepts a relative package-local path", () => {
    expect(assertNoExternalAssetReference("./../icons/react.svg")).toBe(
      "./../icons/react.svg"
    )
  })

  test.each([["https://evil.example/x.svg"], ["http://cdn/x.svg"]])(
    "rejects a remote URL: %s",
    (path) => {
      expect(() => assertNoExternalAssetReference(path)).toThrow(
        GenerationError
      )
    }
  )

  test("rejects a path that escapes the package via ..", () => {
    expect(() => assertNoExternalAssetReference("../../../etc/passwd")).toThrow(
      GenerationError
    )
  })

  test("rejects a nested icons subdirectory the package never uses", () => {
    expect(() =>
      assertNoExternalAssetReference("./../icons/sub/react.svg")
    ).toThrow(GenerationError)
  })
})

describe("assertReferencedAssetsExist", () => {
  test("passes when every referenced asset is available", () => {
    expect(() =>
      assertReferencedAssetsExist(
        new Set(["a.svg"]),
        new Set(["a.svg", "b.svg"])
      )
    ).not.toThrow()
  })

  test("throws when a referenced asset is missing", () => {
    expect(() =>
      assertReferencedAssetsExist(
        new Set(["a.svg", "missing.svg"]),
        new Set(["a.svg"])
      )
    ).toThrow(GenerationError)
  })
})

describe("assertNoUnreferencedAssets", () => {
  test("passes when every available asset is referenced", () => {
    expect(() =>
      assertNoUnreferencedAssets(
        new Set(["a.svg", "b.svg"]),
        new Set(["a.svg", "b.svg"])
      )
    ).not.toThrow()
  })

  test("throws when an asset was generated but never referenced", () => {
    expect(() =>
      assertNoUnreferencedAssets(
        new Set(["a.svg"]),
        new Set(["a.svg", "orphan.svg"])
      )
    ).toThrow(GenerationError)
  })
})

describe("assertDeterministic", () => {
  test("passes for two structurally identical values", () => {
    expect(() =>
      assertDeterministic({ a: [1, 2] }, { a: [1, 2] }, "manifest")
    ).not.toThrow()
  })

  test("throws when two runs produce different output", () => {
    expect(() => assertDeterministic({ a: 1 }, { a: 2 }, "manifest")).toThrow(
      GenerationError
    )
  })
})
