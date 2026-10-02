import OpenBunnyTheme
import OpenBunnyUI
import SwiftUI

@main
struct GlyphmarkApp: App {
  @State private var model = ExtensionStatusModel(
    identifier: BundleIdentifiers.extensionID,
    querying: LiveSafariExtensionQuerying()
  )

  private let fontFailure: String? = {
    do {
      try Fonts.register()
      return nil
    } catch {
      return error.localizedDescription
    }
  }()

  var body: some Scene {
    WindowGroup {
      ContentView(model: model, fontFailure: fontFailure)
        .openbunnyTheme()
    }
    .windowResizability(.contentSize)
  }
}
