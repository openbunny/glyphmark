# Contributing

How to build, test and submit a change to `glyphmark`.

## Contents

- [Development](#development)
- [Signing](#signing)
- [Commits and pull requests](#commits-and-pull-requests)
- [Developer Certificate of Origin](#developer-certificate-of-origin)
- [Reporting bugs](#reporting-bugs)

## Development

- Install the tools: `mise trust`, `mise install`, then `bun install --frozen-lockfile`.
  The Xcode named in `.xcode-version` comes from the machine.
- Install git hooks once per clone: `lefthook install`. `lefthook.yml` checks
  formatting, editorconfig, Swift format and secrets on commit, and runs the
  TypeScript gates on push.
- `just check` runs every gate and reports every failure together. `just --list`
  names them. `just exhaustive` adds the sanitizer runs.
- TypeScript changes need no Xcode: `bun run build`, `bun run typecheck`,
  `bun run lint`, `bun run test`. A bare `bun test` fails on a fresh clone
  because it skips the generate step that `bun run test` runs.
- The Swift recipes run `xcodegen generate` first. `xcodebuild` run directly
  fails with `projectNotGenerated` until the project exists.
- Every pull request is gated by these workflows: `ci.yml`, `dco.yml`,
  `gitleaks.yml`, `reuse.yml`, `security.yml` and `zizmor.yml`.
- Colours, fonts, sizes and radii come from `openbunny-theme`, checked out next
  to this repository. `just semgrep-theme` and `just stylelint` reject a colour, font, radius,
  font-size or spacing literal.
- A new provider ships a fixture under `tests/fixtures` holding markup
  structure only, with placeholder repository names, and a test against it.
- Every change ships tests for the behaviour it adds or fixes.

## Signing

The gates build with `CODE_SIGNING_ALLOWED=NO`. To load the extension in Safari,
copy `DeveloperTeam.xcconfig.example` to `DeveloperTeam.xcconfig`, set
`DEVELOPMENT_TEAM` to a Personal Team ID, and run `just install-app`. Without the
file, `just install-app` exits with an error naming it. A signed Release build
fails with `DEVELOPMENT_TEAM is unset` when no team is set. Never commit the
file or a team ID.

## Commits and pull requests

- One logical change per commit. Use Conventional Commits headers: `feat:`,
  `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- The pull request states what changed and why, and links related issues.
- Do not weaken a lint rule, delete a failing test or widen a suppression to
  make CI pass. Fix the cause, or say why the gate is wrong.
- `AGENTS.md` holds the rules for comments, documents and wording. Doc
  comments are forbidden in Swift, and comments elsewhere are kept to a short
  list that `.semgrep-comments.yml` enforces.

## Developer Certificate of Origin

Every commit must carry a `Signed-off-by` trailer, certifying you wrote it or
otherwise have the right to submit it under the
[Developer Certificate of Origin](https://developercertificate.org/). Add it
with `git commit --signoff` (or `-s`). This project does not use a Contributor
License Agreement; the DCO is the only requirement.

## Reporting bugs

Open an issue with the page URL, the Safari and macOS versions and the
behaviour observed. For a security report, follow [SECURITY.md](SECURITY.md)
instead.
