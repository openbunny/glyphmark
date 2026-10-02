import Foundation
import Testing

@Suite
struct PrivacyManifestTests {
  static let sources = ["App/PrivacyInfo.xcprivacy", "Extension/PrivacyInfo.xcprivacy"]

  @Test("privacy manifest declares no tracking", arguments: sources)
  func noTracking(path: String) throws {
    let manifest = try ProjectFile.plist(path)
    #expect(manifest["NSPrivacyTracking"] as? Bool == false)
  }

  @Test(
    "privacy manifest declares empty collection and API arrays",
    arguments: [
      "NSPrivacyTrackingDomains", "NSPrivacyCollectedDataTypes", "NSPrivacyAccessedAPITypes",
    ]
  )
  func emptyArrays(key: String) throws {
    for path in Self.sources {
      let manifest = try ProjectFile.plist(path)
      let array = try #require(manifest[key] as? [Any])
      #expect(array.isEmpty, "\(path) declares entries under \(key)")
    }
  }

  @Test("privacy manifest declares exactly the four known keys", arguments: sources)
  func exactKeySet(path: String) throws {
    let manifest = try ProjectFile.plist(path)
    #expect(
      Set(manifest.keys) == [
        "NSPrivacyTracking",
        "NSPrivacyTrackingDomains",
        "NSPrivacyCollectedDataTypes",
        "NSPrivacyAccessedAPITypes",
      ]
    )
  }

  @Test("the app and the extension declare the same manifest")
  func sameManifest() throws {
    let app = try Data(contentsOf: ProjectFile.url("App/PrivacyInfo.xcprivacy"))
    let appex = try Data(contentsOf: ProjectFile.url("Extension/PrivacyInfo.xcprivacy"))
    #expect(app == appex)
  }

  @Test("the built app bundles PrivacyInfo.xcprivacy")
  func builtApp() throws {
    let url = try BuiltProducts.app().appendingPathComponent(
      "Contents/Resources/PrivacyInfo.xcprivacy")
    #expect(FileManager.default.fileExists(atPath: url.path), "missing \(url.path)")
  }

  @Test("the built extension bundles PrivacyInfo.xcprivacy")
  func builtExtension() throws {
    let url = try BuiltProducts.appex().appendingPathComponent(
      "Contents/Resources/PrivacyInfo.xcprivacy")
    #expect(FileManager.default.fileExists(atPath: url.path), "missing \(url.path)")
  }
}
