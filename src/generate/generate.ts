import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { availableIconPacks, generateManifest } from "material-icon-theme"

import { buildIconManifest } from "./manifest.ts"
import type { IconManifest, MitManifest } from "./types.ts"
import {
  assertDeterministic,
  assertNoUnreferencedAssets,
  assertReferencedAssetsExist,
} from "./validate.ts"

console.info(
  "generator: no maintained tool derives typed mappings and a licensed SVG subset from material-icon-theme's runtime API, so this script walks that API directly."
)

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, "..", "generated")
const iconsOutDir = join(outDir, "icons")
const packageDir = dirname(
  fileURLToPath(import.meta.resolve("material-icon-theme/package.json"))
)
const packageIconsDir = join(packageDir, "icons")

const asMit = (m: ReturnType<typeof generateManifest>): MitManifest => {
  if (!m.iconDefinitions)
    throw new Error("generateManifest: no iconDefinitions")
  return { ...m, iconDefinitions: m.iconDefinitions }
}

const base = asMit(generateManifest())
const packVariants = Object.fromEntries(
  availableIconPacks
    .filter((pack) => pack !== "")
    .map((pack) => [pack, asMit(generateManifest({ activeIconPack: pack }))])
)

const manifest = buildIconManifest(base, packVariants)
assertDeterministic(
  manifest,
  buildIconManifest(base, packVariants),
  "icon manifest"
)

const availableInPackage = new Set(
  readdirSync(packageIconsDir).filter((name) => name.endsWith(".svg"))
)
const referenced = new Set(Object.values(manifest.icons))
assertReferencedAssetsExist(referenced, availableInPackage)

rmSync(outDir, { recursive: true, force: true })
mkdirSync(iconsOutDir, { recursive: true })

for (const file of referenced) {
  writeFileSync(
    join(iconsOutDir, file),
    readFileSync(join(packageIconsDir, file))
  )
}
const written = new Set(readdirSync(iconsOutDir))
assertNoUnreferencedAssets(referenced, written)
assertReferencedAssetsExist(referenced, written)

const manifestModule = (data: IconManifest): string =>
  `import type { IconManifest } from "../generate/types.ts"\n\nexport const ICON_MANIFEST: IconManifest = ${JSON.stringify(data, null, 2)}\n`

writeFileSync(join(outDir, "mappings.ts"), manifestModule(manifest))

const iconSvg = Object.fromEntries(
  [...referenced]
    .sort()
    .map((file) => [file, readFileSync(join(iconsOutDir, file), "utf8")])
)
writeFileSync(
  join(outDir, "iconSvg.ts"),
  `export const ICON_SVG: Readonly<Record<string, string>> = ${JSON.stringify(iconSvg)}\n`
)
writeFileSync(
  join(outDir, "material-icon-theme-LICENSE.txt"),
  readFileSync(join(packageDir, "LICENSE"))
)
