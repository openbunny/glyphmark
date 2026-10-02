import { readFileSync } from "node:fs"
import { join } from "node:path"

const themeCss = join(
  import.meta.dirname,
  "..",
  "Resources",
  "generated",
  "theme",
  "css"
)

const declarations = new Map<string, string>()

for (const file of ["tokens.css", "extension-aliases.css"] as const) {
  const css = readFileSync(join(themeCss, file), "utf8")
  for (const statement of css.split(";")) {
    const line = statement.slice(statement.lastIndexOf("\n") + 1).trim()
    const colon = line.indexOf(":")
    if (!line.startsWith("--") || colon < 0) continue
    declarations.set(line.slice(2, colon).trim(), line.slice(colon + 1).trim())
  }
}

const aliasName = (value: string): string | undefined =>
  value.startsWith("var(--") && value.endsWith(")")
    ? value.slice(6, -1)
    : undefined

export const resolveToken = (name: string): string => {
  const value = declarations.get(name)
  if (value === undefined) throw new Error(`token not found: --${name}`)
  const alias = aliasName(value)
  return alias === undefined ? value : resolveToken(alias)
}
