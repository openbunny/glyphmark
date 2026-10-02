import { describe, expect, test } from "bun:test"
import { JSDOM } from "jsdom"

import { onNavigate } from "./navigate.ts"

const freshWindow = () =>
  new JSDOM("<!doctype html><body></body>", {
    url: "https://github.com/acme/widgets",
  }).window

describe("onNavigate", () => {
  test("fires on history.pushState", () => {
    const win = freshWindow()
    let calls = 0
    onNavigate(() => {
      calls += 1
    }, win)
    win.history.pushState({}, "", "/acme/widgets/tree/main/src")
    expect(calls).toBe(1)
  })

  test("fires on history.replaceState", () => {
    const win = freshWindow()
    let calls = 0
    onNavigate(() => {
      calls += 1
    }, win)
    win.history.replaceState({}, "", "/acme/widgets/tree/main/lib")
    expect(calls).toBe(1)
  })

  test("fires on popstate", () => {
    const win = freshWindow()
    let calls = 0
    onNavigate(() => {
      calls += 1
    }, win)
    win.dispatchEvent(new win.Event("popstate"))
    expect(calls).toBe(1)
  })

  test("registering a second listener does not double-wrap history.pushState", () => {
    const win = freshWindow()
    let calls = 0
    onNavigate(() => {
      calls += 1
    }, win)
    let secondCalls = 0
    onNavigate(() => {
      secondCalls += 1
    }, win)
    win.history.pushState({}, "", "/acme/widgets/tree/main/again")
    expect(calls).toBe(1)
    expect(secondCalls).toBe(1)
  })

  test("the returned cleanup stops future notifications", () => {
    const win = freshWindow()
    let calls = 0
    const stop = onNavigate(() => {
      calls += 1
    }, win)
    stop()
    win.history.pushState({}, "", "/acme/widgets/tree/main/gone")
    expect(calls).toBe(0)
  })

  test("two independent windows do not leak navigation events to each other", () => {
    const winA = freshWindow()
    const winB = freshWindow()
    let callsA = 0
    let callsB = 0
    onNavigate(() => {
      callsA += 1
    }, winA)
    onNavigate(() => {
      callsB += 1
    }, winB)
    winA.history.pushState({}, "", "/a")
    expect(callsA).toBe(1)
    expect(callsB).toBe(0)
  })
})
