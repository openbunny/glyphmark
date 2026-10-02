# Security policy

## Reporting a vulnerability

Report suspected vulnerabilities privately, not through a public issue. Where
GitHub private vulnerability reporting is enabled, use the repository's
**Security** tab and choose **Report a vulnerability**; otherwise contact an
organization administrator directly.

Include the affected site, the page URL pattern, the impact, and steps to
reproduce. A maintainer acknowledges the report and coordinates a fix and
disclosure.

## Scope

This policy covers the extension and the companion app in this repository. The
supported version is the latest tagged release.

The content script runs on the third-party hosts in `Resources/manifest.json`
and reads their page markup. In scope: any path that sends page content off
the device, widens the host list or permissions, or lets page content run as
script in the extension. Out of scope: defects in the sites themselves.

## Network behaviour

The extension and the app make no network request and send no telemetry. See
[PRIVACY.md](PRIVACY.md).
