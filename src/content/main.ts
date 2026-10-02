import { ICON_SVG } from "../generated/iconSvg.ts"
import { providerFor } from "../providers/index.ts"
import { readSettings } from "../shared/storage.ts"
import { watchProvider } from "./watch.ts"

const ACTIVE_KEY = Symbol.for("glyphmark.active")

const iconUrl = (filename: string): string => {
  const svg = Object.hasOwn(ICON_SVG, filename) ? ICON_SVG[filename] : undefined
  return svg === undefined
    ? ""
    : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const bootstrap = async (): Promise<void> => {
  if (Reflect.get(globalThis, ACTIVE_KEY) === true) return
  Reflect.set(globalThis, ACTIVE_KEY, true)

  const provider = providerFor(new URL(location.href))
  if (!provider) return

  const settings = await readSettings(browser.storage.local)
  const handle = watchProvider(provider, settings, iconUrl)

  browser.storage.onChanged.addListener(() => {
    void readSettings(browser.storage.local).then((next) =>
      handle.refresh(next)
    )
  })
}

void bootstrap()
