import {
  PROVIDER_LABELS,
  setGlobalEnabled,
  setSiteEnabled,
} from "../options/state.ts"
import { getButton, getElement, getInput } from "../shared/domQuery.ts"
import { providerFor } from "../providers/index.ts"
import { isProviderId, type ProviderId } from "../shared/provider.ts"
import { readSettings, writeSettings } from "../shared/storage.ts"

const activeTabProvider = async (): Promise<ProviderId | undefined> => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
  if (tab?.url === undefined) return undefined
  const id = providerFor(new URL(tab.url))?.id
  return isProviderId(id) ? id : undefined
}

const bootstrap = async (): Promise<void> => {
  let settings = await readSettings(browser.storage.local)
  const activeProvider = await activeTabProvider()

  const globalEnabled = getInput("global-enabled")
  globalEnabled.checked = settings.enabled
  globalEnabled.addEventListener("change", () => {
    settings = setGlobalEnabled(settings, globalEnabled.checked)
    void writeSettings(browser.storage.local, settings)
  })

  if (activeProvider) {
    getElement("site-row").hidden = false
    getElement("site-label").textContent = PROVIDER_LABELS[activeProvider]
    const siteEnabled = getInput("site-enabled")
    siteEnabled.checked = settings.siteEnabled[activeProvider]
    siteEnabled.addEventListener("change", () => {
      settings = setSiteEnabled(settings, activeProvider, siteEnabled.checked)
      void writeSettings(browser.storage.local, settings)
    })
  }

  getButton("open-settings").addEventListener("click", () => {
    void browser.runtime.openOptionsPage()
  })
}

void bootstrap()
