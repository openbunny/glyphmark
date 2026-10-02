import Foundation

enum BuiltProductsError: Error {
  case appNotBuilt(String)
}

enum BuiltProducts {
  private final class Anchor {}

  static let appName = "Glyphmark.app"
  static let extensionPath = "Contents/PlugIns/Glyphmark Extension.appex"

  static func app() throws -> URL {
    let url = Bundle(for: Anchor.self).bundleURL
      .deletingLastPathComponent()
      .appendingPathComponent(appName)
    guard FileManager.default.fileExists(atPath: url.path) else {
      throw BuiltProductsError.appNotBuilt(url.path)
    }
    return url
  }

  static func appex() throws -> URL {
    try app().appendingPathComponent(extensionPath)
  }
}
