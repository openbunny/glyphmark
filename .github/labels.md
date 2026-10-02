# Label taxonomy

Three prefixes: `type/*` classifies an issue, `area/*` locates it, `status/*`
tracks it through triage. Every issue and PR carries exactly one `type/*`
label; `area/*` and `status/*` are added during triage.

## type/*

| Label           | Meaning                                                   |
| --------------- | --------------------------------------------------------- |
| `type/bug`      | The extension behaves differently from what it documents. |
| `type/feature`  | A new forge, setting, or behaviour.                       |
| `type/docs`     | README, CONTRIBUTING, or other documentation only.        |
| `type/chore`    | Build, dependency, or repository maintenance.             |
| `type/security` | A vulnerability report or hardening change.               |

## area/*

| Label            | Covers                                              |
| ---------------- | --------------------------------------------------- |
| `area/providers` | Per-forge DOM matching in `src/providers`           |
| `area/content`   | Content script: observing, applying and navigation  |
| `area/ui`        | Popup and options pages                             |
| `area/app`       | SwiftUI companion app and the Safari shim           |
| `area/icons`     | Icon generation and the Material Icon Theme mapping |
| `area/ci`        | GitHub Actions workflows, release automation        |
| `area/docs`      | README, CONTRIBUTING, and other tracked docs        |

## status/*

| Label                 | Meaning                                                         |
| --------------------- | --------------------------------------------------------------- |
| `status/needs-triage` | Default label on a new issue; a maintainer has not reviewed it. |
| `status/confirmed`    | A maintainer reproduced the bug or accepted the proposal.       |
| `status/blocked`      | Waiting on an external dependency or decision.                  |
| `status/wontfix`      | Closed without a change; the issue states why.                  |
