import Testing

@Suite
struct InfoPlistTests {
  @Test("app Info.plist takes its bundle identifier from the build setting")
  func appBundleIdentifier() throws {
    let plist = try ProjectFile.plist("App/Info.plist")
    #expect(plist["CFBundleIdentifier"] as? String == "$(PRODUCT_BUNDLE_IDENTIFIER)")
  }

  @Test("app Info.plist derives the extension identifier from its own")
  func appExtensionIdentifier() throws {
    let plist = try ProjectFile.plist("App/Info.plist")
    #expect(
      plist[BundleIdentifiers.extensionKey] as? String == "$(PRODUCT_BUNDLE_IDENTIFIER).extension")
  }

  @Test("app Info.plist pins the deployment target used everywhere else")
  func appDeploymentTarget() throws {
    let plist = try ProjectFile.plist("App/Info.plist")
    #expect(plist["LSMinimumSystemVersion"] as? String == "15.0")
  }

  @Test("app Info.plist names NSApplication as its principal class")
  func appPrincipalClass() throws {
    let plist = try ProjectFile.plist("App/Info.plist")
    #expect(plist["NSPrincipalClass"] as? String == "NSApplication")
  }

  @Test("extension Info.plist takes its bundle identifier from the build setting")
  func extensionBundleIdentifier() throws {
    let plist = try ProjectFile.plist("Extension/Info.plist")
    #expect(plist["CFBundleIdentifier"] as? String == "$(PRODUCT_BUNDLE_IDENTIFIER)")
  }

  @Test("extension Info.plist registers as a Safari web extension")
  func extensionPointIdentifier() throws {
    let plist = try ProjectFile.plist("Extension/Info.plist")
    let nsExtension = try #require(plist["NSExtension"] as? [String: Any])
    #expect(
      nsExtension["NSExtensionPointIdentifier"] as? String == "com.apple.Safari.web-extension")
  }

  @Test("extension Info.plist names the handler as its principal class")
  func extensionPrincipalClass() throws {
    let plist = try ProjectFile.plist("Extension/Info.plist")
    let nsExtension = try #require(plist["NSExtension"] as? [String: Any])
    #expect(
      nsExtension["NSExtensionPrincipalClass"] as? String
        == "$(PRODUCT_MODULE_NAME).SafariWebExtensionHandler"
    )
  }
}
