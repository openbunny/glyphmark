# Privacy

Glyphmark collects, transmits and shares no data. It contains no analytics and
makes no network request. `tests/no-network.test.ts` fails the build on
`fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon`,
`sendMessage`, `sendNativeMessage`, `eval`, `new Function`, `new Image`, dynamic
`import()` and a remote URL in the runtime sources, and on the same patterns in
the bundled content script.

## What is stored

Settings are stored in `browser.storage.local` in
the browser on the same device. They hold the enabled switches, the icon size,
the icon pack and the custom filename, extension and folder mappings. Nothing
leaves the device. Removing the extension removes them. The extension stores no
browsing history, no visited site and no page content.

The popup reads the URL of the active tab to show the switch for the current
site. Whether Safari returns that URL for a host the user has not granted has
not been measured on this project. Apple documents per-site permission in
[Managing Safari web extension permissions](https://developer.apple.com/documentation/safariservices/managing-safari-web-extension-permissions).
The popup does not store the URL.

The content script adds no `data-*` attribute to any element and loads icons as
`data:` URLs, so no `safari-web-extension://` URL appears in the page. It does
change the page: it inserts an `<img>` element after each replaced element, with
`alt`, `aria-hidden`, `width`, `height` and inline `style` attributes, and sets
the inline `display` of the replaced element to `none`. Page script can read
all of these. A host whose Content-Security-Policy omits `data:` from `img-src`
blocks the icons.

## What the extension reads

The content script reads the file-listing markup of the pages on the listed
hosts, to find file and folder names, and replaces their icons. It runs only
on those hosts, only in the top frame, and does not record or transmit what it
reads.

## Permissions

| Permission                                      | Reason                                                                                                                   |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `storage`                                       | Keep the settings listed above.                                                                                          |
| `host_permissions` and content script `matches` | Run on the hosts in `Resources/manifest.json`. Each host is a source-hosting site whose listings the extension re-icons. |

The extension requests no `<all_urls>`, `tabs`, `activeTab`, `scripting`,
`nativeMessaging` or `webRequest` permission. `tests/manifest.test.ts`
enforces that. Self-hosted forges are not matched.

## Companion app

The app asks Safari whether the extension is enabled and opens Safari's
settings. It stores nothing, reads no user content and makes no network
request. `App/PrivacyInfo.xcprivacy` declares no tracking and no collected
data types.
