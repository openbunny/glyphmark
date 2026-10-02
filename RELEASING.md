# Releasing

## Version

`package.json` holds the version. release-please updates it, `Resources/manifest.json`
and `MARKETING_VERSION` in `project.yml` in one release pull request.
`tests/metadata.test.ts` fails when they differ. A tag is `v` followed by that
version.

## Pipeline

`ci.yml` runs on `pull_request` and `push`. It builds unsigned with
`CODE_SIGNING_ALLOWED=NO` and has no environment. The theme dependencies use a
public Git commit, so a fork pull request needs no repository secret to build.

`release.yml` runs on a `v*` tag. It runs `ci.yml`, the security, gitleaks and
REUSE workflows and the tag-version check. The `sign-notarize-publish` job then
runs in the `release` environment, imports the Developer ID Application
certificate into a temporary keychain, archives and exports the app with
`xcodebuild`, submits it with `xcrun notarytool`, staples the ticket, checks it
with `spctl`, and uploads `Glyphmark-<tag>.zip` and its SHA-256 checksum to the
GitHub release. It deletes the keychain and key files in a final step that
always runs. The job does not use `codesign --deep`.

The job fails before it builds, with `Release secrets missing` and the missing
names, when the `release` environment lacks a required secret. Notarization
that does not report `Accepted` fails the job with `Notarization not accepted`.
Nothing is published in either case.

## Owner setup

1. Create the `release` environment. Restrict its deployment branches and tags
   to `v*` and require one reviewer. Environment protection applies only to
   public repositories on the free plan.
2. Add these environment secrets:
   - `DEVELOPER_ID_CERTIFICATE_P12`: the Developer ID Application certificate
     and private key as base64 PKCS#12.
   - `DEVELOPER_ID_CERTIFICATE_PASSWORD`: the PKCS#12 password.
   - `DEVELOPMENT_TEAM`: the Apple team ID.
   - `NOTARY_API_KEY_P8`: the App Store Connect API key as base64.
   - `NOTARY_API_KEY_ID`: the key ID.
   - `NOTARY_API_ISSUER_ID`: the issuer ID of a Team key. [Individual keys cannot
     use notarytool](https://developer.apple.com/documentation/AppStoreConnectAPI/creating-api-keys-for-app-store-connect-api).
3. Set `RELEASE_PLEASE_TOKEN` to a token that can trigger workflows. A tag
   pushed with `GITHUB_TOKEN` does not start `release.yml`.

## Platform floor

Safari 18.4 or later loads a Developer ID signed extension on macOS. State this
floor in every channel that distributes the signed archive. The Mac App Store
is not a release channel for this repository.
