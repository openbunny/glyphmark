import { describe, expect, test } from "bun:test"
import { JSDOM } from "jsdom"

import {
  applyIcon,
  hasInlineStyle,
  iconFor,
  isApplied,
  restoreIcon,
} from "./dom.ts"

const displayOf = (el: Element): string =>
  hasInlineStyle(el) ? el.style.display : ""

const svgTarget = (): Element => {
  const dom = new JSDOM(`<svg class="octicon"></svg>`)
  const found = dom.window.document.querySelector("svg")
  if (!found) throw new Error("fixture: svg not found")
  return found
}

describe("applyIcon", () => {
  test("inserts a decorative, hidden image after the target", () => {
    const target = svgTarget()
    const { image } = applyIcon(target, "icon:folder.svg", 16)
    expect(image.getAttribute("aria-hidden")).toBe("true")
    expect(image.alt).toBe("")
    expect(image.src).toBe("icon:folder.svg")
    expect(target.nextSibling).toBe(image)
  })

  test("hides the original target rather than removing it", () => {
    const target = svgTarget()
    applyIcon(target, "icon:folder.svg", 16)
    expect(displayOf(target)).toBe("none")
    expect(target.parentNode).not.toBeNull()
    expect(target.isConnected).toBe(true)
  })

  test("leaves no glyphmark attribute that a page script could read", () => {
    const target = svgTarget()
    const { image } = applyIcon(target, "icon:folder.svg", 16)
    for (const node of [target, image])
      expect(
        node.getAttributeNames().filter((name) => name.includes("glyphmark"))
      ).toEqual([])
  })

  test("is idempotent: a second call reuses the same image node", () => {
    const target = svgTarget()
    const first = applyIcon(target, "icon:folder.svg", 16)
    const second = applyIcon(target, "icon:folder.svg", 16)
    expect(second.image).toBe(first.image)
    expect(target.parentElement?.querySelectorAll("img").length).toBe(1)
  })

  test("updates the image in place when the icon URL changes", () => {
    const target = svgTarget()
    applyIcon(target, "icon:folder.svg", 16)
    const updated = applyIcon(target, "icon:folder-open.svg", 16)
    expect(updated.image.src).toBe("icon:folder-open.svg")
    expect(target.parentElement?.querySelectorAll("img").length).toBe(1)
  })

  test("copies the target's margin and vertical-align onto the replacement image", () => {
    const target = svgTarget()
    if (!hasInlineStyle(target)) throw new Error("fixture: svg has no style")
    target.style.marginRight = "8px"
    target.style.verticalAlign = "text-bottom"
    const { image } = applyIcon(target, "icon:folder.svg", 16)
    expect(image.style.marginRight).toBe("8px")
    expect(image.style.verticalAlign).toBe("text-bottom")
    expect(image.style.display).toBe("inline-block")
  })

  test("copies class-derived margin onto the replacement image", () => {
    const dom = new JSDOM(
      `<!doctype html><style>.tw-mr-2{margin-right:8px;vertical-align:text-top}</style><svg class="tw-mr-2"></svg>`
    )
    const target = dom.window.document.querySelector("svg")
    if (!target) throw new Error("fixture: svg not found")
    const { image } = applyIcon(target, "icon:folder.svg", 16)
    expect(image.style.marginRight).toBe("8px")
    expect(image.style.verticalAlign).toBe("text-top")
  })

  test("isApplied and iconFor reflect current state", () => {
    const target = svgTarget()
    expect(isApplied(target)).toBe(false)
    expect(iconFor(target)).toBeUndefined()
    applyIcon(target, "icon:folder.svg", 16)
    expect(isApplied(target)).toBe(true)
    expect(iconFor(target)?.src).toBe("icon:folder.svg")
  })
})

describe("restoreIcon", () => {
  test("removes the injected image and restores the original display", () => {
    const dom = new JSDOM(`<div><svg style="display:inline-block"></svg></div>`)
    const target = dom.window.document.querySelector("svg")
    if (!target) throw new Error("fixture: svg not found")
    applyIcon(target, "icon:folder.svg", 16)
    restoreIcon(target)
    expect(isApplied(target)).toBe(false)
    expect(displayOf(target)).toBe("inline-block")
    expect(target.parentElement?.querySelectorAll("img").length).toBe(0)
  })

  test("is a no-op when nothing was applied", () => {
    const target = svgTarget()
    expect(() => restoreIcon(target)).not.toThrow()
    expect(isApplied(target)).toBe(false)
  })
})
