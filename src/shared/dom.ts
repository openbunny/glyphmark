const applied = new WeakMap<Element, HTMLImageElement>()
const previousDisplay = new WeakMap<Element, string>()

export const hasInlineStyle = (
  el: Element
): el is Element & ElementCSSInlineStyle => "style" in el

export interface AppliedIcon {
  readonly target: Element
  readonly image: HTMLImageElement
}

export const iconFor = (target: Element): HTMLImageElement | undefined =>
  applied.get(target)

export const applyIcon = (
  target: Element,
  src: string,
  sizePx: number
): AppliedIcon => {
  const existing = applied.get(target)
  if (existing) {
    if (existing.src !== src) existing.src = src
    existing.width = sizePx
    existing.height = sizePx
    return { target, image: existing }
  }
  const doc = target.ownerDocument
  const image = doc.createElement("img")
  image.src = src
  image.width = sizePx
  image.height = sizePx
  image.alt = ""
  image.setAttribute("aria-hidden", "true")
  image.style.display = "inline-block"
  const view = target.ownerDocument.defaultView
  const computed = view?.getComputedStyle(target)
  if (computed) {
    image.style.marginTop = computed.marginTop
    image.style.marginRight = computed.marginRight
    image.style.marginBottom = computed.marginBottom
    image.style.marginLeft = computed.marginLeft
    image.style.verticalAlign = computed.verticalAlign
  }
  if (hasInlineStyle(target)) {
    if (target.style.marginRight)
      image.style.marginRight = target.style.marginRight
    if (target.style.verticalAlign)
      image.style.verticalAlign = target.style.verticalAlign
  }
  if (hasInlineStyle(target)) {
    previousDisplay.set(target, target.style.display)
    target.style.display = "none"
  }
  target.after(image)
  applied.set(target, image)
  return { target, image }
}

export const restoreIcon = (target: Element): void => {
  const image = applied.get(target)
  if (!image) return
  image.remove()
  applied.delete(target)
  const display = previousDisplay.get(target)
  if (display !== undefined && hasInlineStyle(target))
    target.style.display = display
  previousDisplay.delete(target)
}

export const isApplied = (target: Element): boolean => applied.has(target)
