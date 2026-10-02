import { cpSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { build } from "esbuild"

console.info(
  "build: no maintained tool bundles this Safari extension's three entry points and copies the theme package's CSS and fonts in one step, so this script wires esbuild directly."
)

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const resources = join(root, "Resources")
const generated = join(resources, "generated")

mkdirSync(generated, { recursive: true })

const entries: readonly [string, string][] = [
  ["src/content/main.ts", "content/main.js"],
  ["src/options/main.ts", "options.js"],
  ["src/popup/main.ts", "popup.js"],
]

for (const [entryPoint, outfile] of entries) {
  await build({
    entryPoints: [join(root, entryPoint)],
    outfile: join(resources, outfile),
    bundle: true,
    format: "esm",
    target: "safari15",
    minify: true,
    legalComments: "eof",
    logLevel: "error",
  })
}

cpSync(join(root, "src/generated/icons"), join(generated, "icons"), {
  recursive: true,
})

const theme = join(root, "node_modules/@openbunny/theme")
const themeStyles = ["tokens", "extension-aliases", "extension-base", "fonts"]

for (const name of themeStyles) {
  cpSync(
    join(theme, "css", `${name}.css`),
    join(generated, "theme/css", `${name}.css`)
  )
}
cpSync(join(theme, "fonts"), join(generated, "theme/fonts"), {
  recursive: true,
})

cpSync(
  join(root, "src/generated/material-icon-theme-LICENSE.txt"),
  join(generated, "material-icon-theme-LICENSE.txt")
)
