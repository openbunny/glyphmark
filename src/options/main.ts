import {
  getButton,
  getElement,
  getInput,
  getSelect,
} from "../shared/domQuery.ts"
import { PROVIDER_IDS, type ProviderId } from "../shared/provider.ts"
import { isIconSize, type Settings } from "../shared/settings.ts"
import { readSettings, writeSettings } from "../shared/storage.ts"
import {
  ICON_PACK_OPTIONS,
  iconKeyExists,
  iconUrlForKey,
  PROVIDER_LABELS,
  removeMappingEntry,
  resetToDefaults,
  setGlobalEnabled,
  setIconPack,
  setIconSize,
  setMappingEntry,
  setSiteEnabled,
} from "./state.ts"

type MappingField = "customFileNames" | "customExtensions" | "customFolderNames"
const MAPPING_FIELDS: readonly MappingField[] = [
  "customExtensions",
  "customFileNames",
  "customFolderNames",
]

const iconUrl = (filename: string): string =>
  browser.runtime.getURL(`generated/icons/${filename}`)

const renderSites = (
  settings: Settings,
  onToggle: (id: ProviderId, v: boolean) => void
): void => {
  const list = getElement("site-list")
  list.replaceChildren(
    ...PROVIDER_IDS.map((id) => {
      const label = document.createElement("label")
      label.className = "row"
      const input = document.createElement("input")
      input.type = "checkbox"
      input.checked = settings.siteEnabled[id]
      input.addEventListener("change", () => onToggle(id, input.checked))
      label.append(input, ` ${PROVIDER_LABELS[id]}`)
      return label
    })
  )
}

const renderMappingList = (
  field: MappingField,
  settings: Settings,
  onRemove: (key: string) => void
): void => {
  const group = document.querySelector(`[data-field="${field}"]`)
  const list = group?.querySelector("ul.mapping-list")
  if (!list) return
  const entries = Object.entries(settings[field])
  list.replaceChildren(
    ...(entries.length === 0
      ? [
          Object.assign(document.createElement("li"), {
            textContent: "no mappings",
          }),
        ]
      : entries.map(([key, value]) => {
          const li = document.createElement("li")
          const img = document.createElement("img")
          img.alt = ""
          img.src = iconUrl(iconUrlForKey(value) ?? "")
          const text = document.createElement("span")
          text.textContent = `${key} → ${value}`
          const remove = document.createElement("button")
          remove.type = "button"
          remove.textContent = "Remove"
          remove.addEventListener("click", () => onRemove(key))
          li.append(img, text, remove)
          return li
        }))
  )
}

const wireMappingForm = (
  field: MappingField,
  getSettings: () => Settings,
  onChange: (next: Settings) => void
): void => {
  const group = document.querySelector(`[data-field="${field}"]`)
  const form = group?.querySelector("form.mapping-form")
  if (!(form instanceof HTMLFormElement)) return
  const keyInput = form.querySelector<HTMLInputElement>('input[name="key"]')
  const valueInput = form.querySelector<HTMLInputElement>('input[name="value"]')
  const preview = form.querySelector<HTMLImageElement>("img.preview")
  const error = form.querySelector<HTMLParagraphElement>("p.error")
  if (!keyInput || !valueInput) return

  valueInput.addEventListener("input", () => {
    const filename = iconUrlForKey(valueInput.value)
    if (preview && filename) {
      preview.src = iconUrl(filename)
      preview.hidden = false
    } else if (preview) {
      preview.hidden = true
    }
  })

  form.addEventListener("submit", (event) => {
    event.preventDefault()
    const key = keyInput.value.trim()
    const value = valueInput.value.trim()
    if (!key || !value) return
    if (!iconKeyExists(value)) {
      if (error) {
        error.textContent = "unknown icon key, not applied"
        error.hidden = false
      }
      return
    }
    if (error) error.hidden = true
    onChange(setMappingEntry(getSettings(), field, key, value))
    form.reset()
    if (preview) preview.hidden = true
  })
}

const bootstrap = async (): Promise<void> => {
  let settings = await readSettings(browser.storage.local)

  const globalEnabled = getInput("global-enabled")
  const iconSizeSelect = getSelect("icon-size")
  const iconPackSelect = getSelect("icon-pack")
  const resetButton = getButton("reset")

  const persist = async (next: Settings): Promise<void> => {
    settings = next
    await writeSettings(browser.storage.local, settings)
    render()
  }

  const render = (): void => {
    globalEnabled.checked = settings.enabled
    iconSizeSelect.value = settings.iconSize
    iconPackSelect.replaceChildren(
      ...ICON_PACK_OPTIONS.map((pack) => {
        const option = document.createElement("option")
        option.value = pack
        option.textContent = pack === "" ? "None" : pack
        return option
      })
    )
    iconPackSelect.value = settings.iconPack
    renderSites(settings, (id, enabled) => {
      void persist(setSiteEnabled(settings, id, enabled))
    })
    for (const field of MAPPING_FIELDS) {
      renderMappingList(field, settings, (key) => {
        void persist(removeMappingEntry(settings, field, key))
      })
    }
  }

  globalEnabled.addEventListener("change", () => {
    void persist(setGlobalEnabled(settings, globalEnabled.checked))
  })
  iconSizeSelect.addEventListener("change", () => {
    if (isIconSize(iconSizeSelect.value)) {
      void persist(setIconSize(settings, iconSizeSelect.value))
    }
  })
  iconPackSelect.addEventListener("change", () => {
    void persist(setIconPack(settings, iconPackSelect.value))
  })
  resetButton.addEventListener("click", () => {
    void persist(resetToDefaults())
  })
  for (const field of MAPPING_FIELDS) {
    wireMappingForm(
      field,
      () => settings,
      (next) => void persist(next)
    )
  }

  render()
}

void bootstrap()
