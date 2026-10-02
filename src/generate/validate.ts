import { posix } from "node:path"

export class GenerationError extends Error {}

export const buildUniqueRecord = (
  label: string,
  pairs: readonly (readonly [string, string])[]
): Record<string, string> => {
  const result: Record<string, string> = {}
  for (const [key, value] of pairs) {
    const existing = result[key]
    if (existing !== undefined && existing !== value) {
      throw new GenerationError(
        `${label}: duplicate key "${key}" maps to both "${existing}" and "${value}"`
      )
    }
    result[key] = value
  }
  return result
}

const FILENAME_PATTERN = /^[a-z0-9][a-z0-9._-]*\.svg$/

export const assertValidFilename = (name: string): string => {
  if (!FILENAME_PATTERN.test(name)) {
    throw new GenerationError(`invalid generated filename: "${name}"`)
  }
  return name
}

const PACKAGE_ICON_PATH = /^(?:\.\.\/)?icons\/[^/]+$/

export const assertNoExternalAssetReference = (iconPath: string): string => {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(iconPath) || iconPath.startsWith("//")) {
    throw new GenerationError(`external asset reference: "${iconPath}"`)
  }
  const resolved = posix.normalize(iconPath)
  if (!PACKAGE_ICON_PATH.test(resolved)) {
    throw new GenerationError(`asset path escapes the package: "${iconPath}"`)
  }
  return iconPath
}

export const assertReferencedAssetsExist = (
  referenced: ReadonlySet<string>,
  available: ReadonlySet<string>
): void => {
  for (const name of referenced) {
    if (!available.has(name))
      throw new GenerationError(`referenced asset missing: ${name}`)
  }
}

export const assertNoUnreferencedAssets = (
  referenced: ReadonlySet<string>,
  available: ReadonlySet<string>
): void => {
  for (const name of available) {
    if (!referenced.has(name)) {
      throw new GenerationError(`generated asset never referenced: ${name}`)
    }
  }
}

export const assertDeterministic = (
  a: unknown,
  b: unknown,
  label: string
): void => {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw new GenerationError(`non-deterministic output: ${label}`)
  }
}
