import Foundation
import Testing

@Suite
struct ReleaseSigningTests {
  static let teamFileExists = FileManager.default.fileExists(
    atPath: ProjectFile.url("DeveloperTeam.xcconfig").path)

  @Test(
    "a Release build without DEVELOPMENT_TEAM fails with a message naming it",
    .disabled(if: teamFileExists, "DeveloperTeam.xcconfig sets the team on this machine")
  )
  func unsetTeamFails() throws {
    let work = FileManager.default.temporaryDirectory
      .appendingPathComponent("glyphmark-team-\(UUID().uuidString)")
    defer { try? FileManager.default.removeItem(at: work) }
    let process = Process()
    process.executableURL = URL(fileURLWithPath: "/usr/bin/xcodebuild")
    process.arguments = [
      "build",
      "-project", ProjectFile.url("Glyphmark.xcodeproj").path,
      "-scheme", "Glyphmark",
      "-configuration", "Release",
      "-derivedDataPath", work.path,
    ]
    let pipe = Pipe()
    process.standardOutput = pipe
    process.standardError = pipe
    try process.run()
    let data = pipe.fileHandleForReading.readDataToEndOfFile()
    process.waitUntilExit()
    let output = String(bytes: data, encoding: .utf8) ?? ""
    #expect(process.terminationStatus != 0)
    #expect(output.contains("DEVELOPMENT_TEAM is unset"))
  }
}
