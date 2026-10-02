import { describe, expect, test } from "bun:test"
import { JSDOM } from "jsdom"

import { observeMutations } from "./observe.ts"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const rootOf = (dom: JSDOM): Element => {
  const found = dom.window.document.getElementById("root")
  if (!found) throw new Error("fixture: #root not found")
  return found
}

describe("observeMutations", () => {
  test("fires once a microtask after a DOM mutation", async () => {
    const dom = new JSDOM("<!doctype html><body><div id='root'></div></body>")
    const root = rootOf(dom)
    let calls = 0
    observeMutations(root, () => {
      calls += 1
    })
    root.appendChild(dom.window.document.createElement("span"))
    await sleep(0)
    expect(calls).toBe(1)
  })

  test("coalesces a burst of synchronous mutations into one callback", async () => {
    const dom = new JSDOM("<!doctype html><body><div id='root'></div></body>")
    const root = rootOf(dom)
    let calls = 0
    observeMutations(root, () => {
      calls += 1
    })
    for (let i = 0; i < 5; i += 1) {
      root.appendChild(dom.window.document.createElement("span"))
    }
    await sleep(0)
    expect(calls).toBe(1)
  })

  test("attaching a second observer to the same root is a no-op", async () => {
    const dom = new JSDOM("<!doctype html><body><div id='root'></div></body>")
    const root = rootOf(dom)
    let firstCalls = 0
    let secondCalls = 0
    observeMutations(root, () => {
      firstCalls += 1
    })
    observeMutations(root, () => {
      secondCalls += 1
    })
    root.appendChild(dom.window.document.createElement("span"))
    await sleep(0)
    expect(firstCalls).toBe(1)
    expect(secondCalls).toBe(0)
  })

  test("the returned cleanup disconnects and allows re-observing the same root", async () => {
    const dom = new JSDOM("<!doctype html><body><div id='root'></div></body>")
    const root = rootOf(dom)
    let calls = 0
    const stop = observeMutations(root, () => {
      calls += 1
    })
    stop()
    let secondCalls = 0
    observeMutations(root, () => {
      secondCalls += 1
    })
    root.appendChild(dom.window.document.createElement("span"))
    await sleep(0)
    expect(calls).toBe(0)
    expect(secondCalls).toBe(1)
  })
})
