import AppKit
import CoreText
import Foundation
import OpenBunnyTheme
import SwiftUI
import Testing

private struct Rgb {
  let red: Double
  let green: Double
  let blue: Double

  var luminance: Double {
    func linear(_ channel: Double) -> Double {
      channel <= 0.04045 ? channel / 12.92 : pow((channel + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue)
  }

  init(_ color: Color) throws {
    guard let resolved = NSColor(color).usingColorSpace(.sRGB) else {
      throw ThemeTestError.colorSpace
    }
    red = resolved.redComponent
    green = resolved.greenComponent
    blue = resolved.blueComponent
  }
}

private enum ThemeTestError: Error {
  case colorSpace
  case malformedColorset
}

private func contrast(_ foreground: Color, _ background: Color) throws -> Double {
  let first = try Rgb(foreground).luminance
  let second = try Rgb(background).luminance
  return (max(first, second) + 0.05) / (min(first, second) + 0.05)
}

struct TextPair: Sendable {
  let name: String
  let text: Color
  let ground: Color
}

@Suite
struct ThemeTests {
  @Test("the theme fonts register and both families are available")
  func fontsRegister() throws {
    try Fonts.register()
    let available = (CTFontManagerCopyAvailableFontFamilyNames() as? [String]) ?? []
    for family in Fonts.families {
      #expect(available.contains(family))
    }
  }

  @Test("the window is pinned to the theme's colour scheme, which is light")
  func lightOnly() {
    #expect(Scheme.colorScheme == .light)
  }

  @Test("the accent colour asset equals the theme's sprout token")
  func accentColorMatchesToken() throws {
    let data = try Data(
      contentsOf: ProjectFile.url(
        "App/Resources/Assets.xcassets/AccentColor.colorset/Contents.json"))
    guard
      let root = try JSONSerialization.jsonObject(with: data) as? [String: Any],
      let colors = root["colors"] as? [[String: Any]],
      let color = colors.first?["color"] as? [String: Any],
      let components = color["components"] as? [String: String]
    else { throw ThemeTestError.malformedColorset }
    func channel(_ name: String) throws -> Double {
      guard let raw = components[name], let value = Int(raw.dropFirst(2), radix: 16) else {
        throw ThemeTestError.malformedColorset
      }
      return Double(value) / 255.0
    }
    let sprout = try Rgb(.sprout)
    #expect(abs(try channel("red") - sprout.red) < 0.001)
    #expect(abs(try channel("green") - sprout.green) < 0.001)
    #expect(abs(try channel("blue") - sprout.blue) < 0.001)
  }

  @Test(
    "text pairs on the window clear 4.5:1, the ratio that holds under Increase Contrast",
    arguments: [
      TextPair(name: "foreground", text: .foreground, ground: .background),
      TextPair(name: "valid", text: .valid, ground: .background),
      TextPair(name: "expired", text: .expired, ground: .background),
      TextPair(name: "muted", text: .muted, ground: .background),
      TextPair(name: "button", text: .foreground, ground: .paperDeep),
      TextPair(name: "button pressed", text: .foreground, ground: .paperInset),
    ]
  )
  func textContrast(pair: TextPair) throws {
    #expect(try contrast(pair.text, pair.ground) >= 4.5, Comment(rawValue: pair.name))
  }

  @Test("the button border clears 3:1 on the window")
  func borderContrast() throws {
    #expect(try contrast(.border, .background) >= 3)
  }
}
