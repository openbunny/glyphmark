import OpenBunnyTheme
import OpenBunnyUI
import SwiftUI

struct ContentView: View {
  let model: ExtensionStatusModel
  let fontFailure: String?

  var body: some View {
    VStack(spacing: Spacing.loose) {
      statusText
      Button("Safari settings") {
        Task { await model.openSettings() }
      }
      .buttonStyle(.flat)
      if model.lastSettingsOutcome == .failed {
        Text("could not open Safari settings")
          .font(.themeCaption)
          .foregroundStyle(Color.muted)
      }
      if let fontFailure {
        StatusText("theme fonts did not load", status: .unavailable)
          .font(.themeCaption)
        Text(fontFailure)
          .font(.themeCaption)
          .foregroundStyle(Color.muted)
      }
    }
    .padding(Spacing.page)
    .frame(minWidth: 280)
    .task { await model.refresh() }
  }

  private var statusText: StatusText {
    switch model.availability {
    case .enabled:
      StatusText("extension enabled", status: .enabled)

    case .disabled:
      StatusText("extension disabled", status: .disabled)

    case .unavailable:
      StatusText("safari did not return extension status", status: .unavailable)
    }
  }
}
