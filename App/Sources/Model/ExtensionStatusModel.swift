import Observation

@MainActor
@Observable
final class ExtensionStatusModel {
  private(set) var availability: ExtensionAvailability = .unavailable
  private(set) var lastSettingsOutcome: SettingsOpenOutcome?

  private let identifier: String
  private let querying: SafariExtensionQuerying

  init(identifier: String, querying: SafariExtensionQuerying) {
    self.identifier = identifier
    self.querying = querying
  }

  func refresh() async {
    availability = await querying.availability(forExtensionWithIdentifier: identifier)
  }

  func openSettings() async {
    lastSettingsOutcome = await querying.openPreferences(forExtensionWithIdentifier: identifier)
  }
}
