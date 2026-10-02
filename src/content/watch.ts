import type { Provider } from "../shared/provider.ts"
import type { Settings } from "../shared/settings.ts"
import { applyProviderIcons, type IconUrl } from "./apply.ts"
import { onNavigate, type NavigationWindow } from "./navigate.ts"
import { observeMutations } from "./observe.ts"

export interface WatchHandle {
  readonly refresh: (settings: Settings) => void
  readonly stop: () => void
}

export const watchProvider = (
  provider: Provider,
  initialSettings: Settings,
  iconUrl: IconUrl,
  win: NavigationWindow = window
): WatchHandle => {
  let settings = initialSettings

  const run = (): void => {
    const root = provider.observedRoot() ?? win.document.body
    applyProviderIcons(provider, root, settings, iconUrl)
  }

  const stopMutation = observeMutations(win.document.body, run)
  run()
  const stopNav = onNavigate(run, win)

  return {
    refresh: (next) => {
      settings = next
      run()
    },
    stop: () => {
      stopMutation()
      stopNav()
    },
  }
}
