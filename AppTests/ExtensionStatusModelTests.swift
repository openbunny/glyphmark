import Testing

struct FakeSafariExtensionQuerying: SafariExtensionQuerying {
  let availabilityResult: ExtensionAvailability
  let openPreferencesResult: SettingsOpenOutcome
  let receivedIdentifier: RecordedIdentifier

  func availability(forExtensionWithIdentifier identifier: String) async -> ExtensionAvailability {
    await receivedIdentifier.record(identifier)
    return availabilityResult
  }

  func openPreferences(forExtensionWithIdentifier identifier: String) async -> SettingsOpenOutcome {
    await receivedIdentifier.record(identifier)
    return openPreferencesResult
  }
}

actor RecordedIdentifier {
  private(set) var values: [String] = []

  func record(_ value: String) {
    values.append(value)
  }
}

@MainActor
@Suite
struct ExtensionStatusModelTests {
  @Test(
    "refresh reflects every availability the query can return",
    arguments: [ExtensionAvailability.enabled, .disabled, .unavailable]
  )
  func refreshReflectsAvailability(availability: ExtensionAvailability) async {
    let recorder = RecordedIdentifier()
    let model = ExtensionStatusModel(
      identifier: TestIdentifiers.extensionID,
      querying: FakeSafariExtensionQuerying(
        availabilityResult: availability,
        openPreferencesResult: .opened,
        receivedIdentifier: recorder
      )
    )

    await model.refresh()

    #expect(model.availability == availability)
    #expect(await recorder.values == [TestIdentifiers.extensionID])
  }

  @Test("initial availability is unavailable before any refresh")
  func initialAvailability() {
    let model = ExtensionStatusModel(
      identifier: TestIdentifiers.extensionID,
      querying: FakeSafariExtensionQuerying(
        availabilityResult: .enabled,
        openPreferencesResult: .opened,
        receivedIdentifier: RecordedIdentifier()
      )
    )

    #expect(model.availability == .unavailable)
    #expect(model.lastSettingsOutcome == nil)
  }

  @Test(
    "openSettings records every outcome the query can return",
    arguments: [SettingsOpenOutcome.opened, .failed]
  )
  func openSettingsRecordsOutcome(outcome: SettingsOpenOutcome) async {
    let model = ExtensionStatusModel(
      identifier: TestIdentifiers.extensionID,
      querying: FakeSafariExtensionQuerying(
        availabilityResult: .enabled,
        openPreferencesResult: outcome,
        receivedIdentifier: RecordedIdentifier()
      )
    )

    await model.openSettings()

    #expect(model.lastSettingsOutcome == outcome)
  }
}

enum TestIdentifiers {
  static let extensionID = "example.invalid.extension"
}
