# Glyphmark

> **Work in progress.** No release exists yet. Names, identifiers and
> interfaces can change without notice.

Glyphmark is a Safari web extension for macOS. It replaces the file and folder
icons on source-hosting file listings with Material Icon Theme glyphs. A
SwiftUI companion app embeds the extension and reports whether Safari has
enabled it.

Glyphmark is unaffiliated with the sites it supports. It names them only to
identify where it runs.

## Supported sites

The hosts in `host_permissions` of `Resources/manifest.json`: GitHub,
Bitbucket, Azure DevOps, GitLab and its public instances, Gitea, Gitee,
SourceForge, Codeberg and Tangled. Self-hosted instances are not matched,
because the manifest lists fixed hosts only.

## Permissions and privacy

The extension requests the `storage` permission and the listed hosts. It
requests no `<all_urls>`, `tabs`, `activeTab`, `scripting` or `webRequest`
permission. It makes no network request. `tests/no-network.test.ts` enforces
that. [PRIVACY.md](PRIVACY.md) lists each permission and the stored data.

## Build and install

Requirements: macOS, the Xcode named in `.xcode-version`, [mise](https://mise.jdx.dev),
and the Swift toolchain that ships with Xcode. `mise install` provides the other tools.

```console
mise trust
mise install
bun install --frozen-lockfile
just check
```

`just check` runs every gate with `CODE_SIGNING_ALLOWED=NO`. Safari does not
list an extension from an unsigned build unless Develop > Allow Unsigned
Extensions is on.

### TypeScript only

No Xcode is needed to work on the content script, the popup or the options
page.

```console
bun install --frozen-lockfile
bun run build
bun run typecheck
bun run test
```

`bun run build` generates the icon set from `material-icon-theme` into
`src/generated/` and bundles the entry points into `Resources/`. Each script
that reads generated files runs `bun run generate` first through its `pre`
script. Run the scripts with `bun run`; a bare `bun test` skips that step.

### Signed build

Safari loads only a signed extension. The Debug configuration signs with
Apple Development, and a free Personal Team is enough, because the entitlements
request no App Group.

```console
cp DeveloperTeam.xcconfig.example DeveloperTeam.xcconfig
```

Set `DEVELOPMENT_TEAM` in `DeveloperTeam.xcconfig` to the team ID, then run
`just install-app`. `DeveloperTeam.xcconfig` is gitignored, and a semgrep rule
rejects a committed team ID.

The Release configuration signs with Developer ID Application, which needs a
paid Apple Developer Program team. `SigningRelease.xcconfig` holds the
identity. A Release build with signing enabled and no `DEVELOPMENT_TEAM` fails
with `DEVELOPMENT_TEAM is unset`.

## Releases

A tagged release publishes a Developer ID signed, notarized and stapled
`Glyphmark-<tag>.zip` and its SHA-256 checksum to the GitHub release.
`RELEASING.md` describes the workflow and the secrets it needs.

Safari 18.4 or later is required to load a Developer ID signed extension on
macOS. The app deploys to macOS 15.0, and a macOS 15.0 system runs an older
Safari until it is updated. Apple states the Safari 18.4 support in
[this forum thread](https://developer.apple.com/forums/thread/782005). A
source build signed with Apple Development has no such floor. Whether a
notarized build loads without Develop > Allow Unsigned Extensions has not been
measured on this project.

The extension adds no `data-*` attribute to any element and loads its icons as
`data:` URLs. It inserts an `<img>` element after each replaced element and sets
the inline `display` of the replaced element to `none`; page script can read
both. A host whose Content-Security-Policy omits `data:` from `img-src` does not
show the icons.

## Theme

Colours, fonts, sizes and radii come from the OpenBunny theme library.
`project.yml` and `package.json` pin the same theme Git commit for Swift and
TypeScript. After a theme release, replace both Git dependencies with pinned
package versions.

`bun run build` copies the package's CSS and fonts into `Resources/generated/theme`.
The extension pages bundle the fonts and load them from the extension origin.
If a font file fails to register, the app window shows the failure and falls
back to the system font; extension pages fall back to the generic `monospace`
family. The window pins the theme's light colour scheme. Text pairs keep a
contrast ratio of at least 4.5:1, which holds under Increase Contrast.
`just semgrep-theme` and `just stylelint` fail on a colour, font-family, radius,
font-size or spacing literal outside the theme. Widths are the exception: the
popup width in `Resources/popup.css` and the window minimum width in
`App/Sources/App/ContentView.swift` are literals until the theme defines a
width token.

## Bundle identifiers

The app is `io.github.openbunny.glyphmark` and the extension is
`io.github.openbunny.glyphmark.extension`. Anyone who installed a build under
earlier identifiers starts from nothing: Safari treats the new identifiers as a
new extension, so enablement, per-site grants and stored settings do not carry
over, and the old app stays installed until it is deleted. A fork that signs
with its own team changes `APP_BUNDLE_ID` in `project.yml`. Both `Info.plist`
files and the app's lookup of the extension identifier derive from it.

## Licence

MIT, copyright OpenBunny. See [LICENSE](LICENSE). The icons come from
[Material Icon Theme](https://github.com/material-extensions/vscode-material-icon-theme),
also MIT; [NOTICE](NOTICE) carries its notice. The app icon source is
`artwork/app-icon.svg`, an original work covered by the same
licence. The PNG files in `App/Resources/Assets.xcassets/AppIcon.appiconset`
are renders of it.

## Contributing

[CONTRIBUTING.md](CONTRIBUTING.md) covers the workflow, [SECURITY.md](SECURITY.md)
the vulnerability process, and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) the
conduct rules. [RELEASING.md](RELEASING.md) lists the owner-only release steps.
