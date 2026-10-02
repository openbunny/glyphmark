import { applyIcon, restoreIcon } from "../shared/dom.ts"
import { iconFilenameFor } from "../shared/mappings.ts"
import { isProviderId, type Provider } from "../shared/provider.ts"
import {
  ICON_SIZE_PX,
  isSiteEnabled,
  type Settings,
} from "../shared/settings.ts"

export type IconUrl = (filename: string) => string

export const applyProviderIcons = (
  provider: Provider,
  root: ParentNode,
  settings: Settings,
  iconUrl: IconUrl
): void => {
  const enabled =
    isProviderId(provider.id) && isSiteEnabled(settings, provider.id)
  const sizePx = ICON_SIZE_PX[settings.iconSize]
  for (const row of provider.rows(root)) {
    if (!enabled) {
      restoreIcon(row.iconTarget)
      continue
    }
    const filename = iconFilenameFor(row, settings)
    applyIcon(row.iconTarget, iconUrl(filename), sizePx)
  }
}
