import Foundation

enum BundleIdentifiers {
  static let extensionKey = "GlyphmarkExtensionIdentifier"

  static var extensionID: String {
    guard let id = Bundle.main.object(forInfoDictionaryKey: extensionKey) as? String, !id.isEmpty
    else {
      preconditionFailure("App/Info.plist has no \(extensionKey) value.")
    }
    return id
  }
}
