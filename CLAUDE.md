# CLAUDE.md — TechConnect Conference App

Read this before making changes. It exists specifically to preserve context that
isn't obvious from the code alone — several of these were non-obvious bugs that
took real debugging to find. Undoing them will reintroduce the original bugs.

## What this is

A React Native / Expo conference companion app: participant registration with
login, program/speakers/venue info, an admin panel (web-only) for managing
content and participants, QR-code digital badges, and a camera-based check-in
scanner. Full feature list and "what I'd build next" are in `README.md` —
read that too, it's the primary source of truth for scope and known
limitations, not just this file.

## Versioning — bump and tag on every push

`package.json`'s `version` and `app.json`'s `expo.version` are kept in
sync, and every push to `origin/main` gets a matching annotated git tag
(`vX.Y.Z`) on the commit it pushes, pushed to the remote alongside it —
each push is a labeled, checkout-able release, not just an untagged commit.
Bump both files by the same semver rule *before* committing:
- **patch** (`1.2.0` → `1.2.1`): bug fixes, no new user-facing capability.
- **minor** (`1.2.0` → `1.3.0`): new features, additive/backward-compatible
  (this is the common case for this project — most pushes here have been
  new admin capabilities or content, not fixes).
- **major** (`1.x.x` → `2.0.0`): breaking changes — a stored-data shape
  changes in a way older AsyncStorage data can't be read back into, a
  screen/flow is removed, or similar.
Tag with `git tag -a vX.Y.Z -m "<one-line summary>"`, then
`git push origin vX.Y.Z` alongside the normal `git push`. Don't tag a
commit that wasn't itself just pushed to `main`, and don't reuse or
force-move an existing tag — if a version needs correcting, bump again
rather than rewriting a tag someone may have already checked out.

## Stack and why

- **Expo SDK 55**, React Native 0.83, React 19.2.
- **`@react-navigation/stack`, not `@react-navigation/native-stack`, for every
  nested navigator.** This was deliberate: `native-stack` depends on
  `react-native-screens`, which renders a blank white screen on web with no
  error. Don't swap this back for "better native performance" without
  re-testing web thoroughly.
- **`react-native-qrcode-svg` + `react-native-svg`** for badge QR codes.
- **`expo-camera`** for the check-in scanner (works in Expo Go, no dev build
  needed).
- **`expo-file-system` + `expo-sharing`** for local CSV export (web download
  vs. native share sheet, branched by `Platform.OS`).

## Dependency versions — don't hand-pin, and don't leave react/react-dom apart

Most entries in `package.json` are intentionally `"*"`. The correct versions
are resolved by `npx expo install --fix`, which reads the installed `expo`
package's own compatibility table for the SDK — that's the authoritative
source, not any number written by hand. Hand-guessing exact versions has
caused real `ERESOLVE` install failures twice already in this project's
history.

**One hard exception:** `react` and `react-dom` must always be pinned to the
literal same version as each other, never left independently as `"*"` — if
they drift (e.g. `"*"` resolves `react-dom` newer than the `react` version
actually matched to this SDK), `npm install` fails with a peer conflict
between them specifically.

**Bootstrap sequence when `node_modules` is empty or broken:**
```bash
npm install                 # needs to succeed once so a real `expo` package exists locally
npx expo install --fix      # now it can read the SDK and correct every version
npx expo start -c
```
`expo install --fix` needs a working local `expo` install to detect the SDK
version from — running it as the very first command against an empty
`node_modules` fails with "Cannot determine the project's Expo SDK version."

## Two separate web-scrolling fixes — both required, don't remove either

1. `App.js` sets `height: 100%` on `html`/`body`/`#root` on web at module load.
   Metro's default web template doesn't do this itself, so without it
   top-level scroll containers have no bounded height to scroll within.
2. Every `createStackNavigator` in `src/navigation/index.js` sets
   `screenOptions={{ cardStyle: { flex: 1 } }}`. This is a *separate* bug:
   `@react-navigation/stack`'s transition "card" wrapper doesn't reliably
   inherit height on web on its own, independent of fix #1. Plain tab
   screens (Home/Program/Info) worked with only fix #1; every stack-nested
   screen (Register, Login, all Admin screens) additionally needed fix #2.
   Any new `createStackNavigator` added later needs this same option.

## Never use `Alert.alert` with multiple buttons for anything that matters

React Native's multi-button `Alert.alert` doesn't reliably fire per-button
`onPress` callbacks on web (it depends on the browser's `window.confirm`,
which doesn't map cleanly onto that API). This silently broke the logout
button and delete confirmations in an earlier version. Use
`src/components/ConfirmModal.js` for any confirm/cancel action instead —
it's the established pattern, reused across logout, and delete flows for
sessions/speakers/participants.

## Auth & permission model (`src/context/AppContext.js`)

- `accounts`: array of all registered participant/staff accounts (plain-text
  passwords — prototype only, see README security notes).
- `session`: `{ role: 'participant', email }` | `{ role: 'admin' }` | `null`.
- `currentUser`: derived — the account matching a participant session.
- `isAdminSession`: true only for the hardcoded shared `admin`/`admin` login,
  and only on web (`Platform.OS === 'web'`) — `loginAdmin` itself refuses on
  other platforms.
- `hasAdminAccess`: `isAdminSession OR (currentUser.isSubAdmin)`. Only the
  `isAdminSession` half is web-only (inherited from that flag); the
  sub-admin half is **not** platform-restricted — sub-admins can log in and
  use admin tools (including the camera check-in scanner) from mobile too,
  not just web. **This is the flag actually checked inside every admin
  mutation** (add/edit/delete session, speaker, org info, announcement,
  account, check-in) — not just in the screens that show the buttons for
  them. If you add a new admin action, guard it the same way at the
  context-function level, not only in the UI. A participant successfully
  posting an announcement was a real bug caused by skipping this once
  already.
- Sub-admins are participant accounts with `isSubAdmin: true`, created via
  Manage Participants → "+ Add person" (admin creates accounts on someone's
  behalf, including setting their password directly). They log in through
  the normal participant Login screen (not the web-only Administrator
  login) on either web or mobile.

## Internationalization (English + Czech)

- `src/i18n/en.js` and `src/i18n/cs.js` are flat-nested dictionaries (e.g.
  `register.firstName`), `src/i18n/index.js` exports `LANGUAGES` (the
  switcher's option list), `DEFAULT_LANGUAGE` ('en'), and `translate(lang,
  key, vars)` — dot-path lookup with `{{var}}` interpolation, falling back to
  English then to the raw key if a key is missing in the active language.
- `AppContext` owns the active `language`, persists it to AsyncStorage the
  same way as every other piece of state, and exposes `t(key, vars)` (a thin
  wrapper around `translate`) plus `setLanguage(code)`. Every screen/component
  that renders user-facing text pulls `t` from `useApp()` — this is a plain
  function, not a hook, so it's safe to call conditionally or inside loops
  (e.g. mapping role chips through `t(\`roles.${r}\`)`).
- `src/components/LanguageButton.js` is the switcher: a small floating pill
  (globe flag + code) rendered once in `App.js`'s `AppShell`, inside the same
  flex wrapper as `RootNavigator` so it sits over screen content in a corner
  rather than reserving layout space — deliberately different from the
  sponsor banner's "never overlay content" rule, since this button is small,
  persistent, and the whole point is being reachable from anywhere including
  the pre-auth Welcome screen. Tapping it opens a bottom-sheet modal (the
  same pattern as every other picker in this app), not an inline dropdown.
- Two kinds of translation, two different mechanisms:
  - **Interface chrome** (labels, buttons, headers, alerts, validation
    messages) goes through the `t(key, vars)` dictionary described above.
  - **Seed content** (`src/data/event.js`, `sessions.js`, `speakers.js`,
    `orgInfo.js`, `materials.js`, `terms.js`) is bilingual too, but stored
    differently: a translatable field is `{ en: '...', cs: '...' }` instead
    of a plain string (e.g. `session.title`, `speaker.bio`,
    `orgInfo.venue.description`). Render it with `localize(field)` (also
    from `useApp()`, backed by `localizeField` in `src/i18n/index.js`) —
    never read `.en`/`.cs` directly. `localize` passes plain strings and
    arrays through unchanged, so it's always safe to call even on a field
    that isn't bilingual.
  - Proper nouns are never wrapped in either mechanism: speaker `name`,
    hotel `name`, `organizerContact.name`/`email`/`phone`, the venue's
    physical `address`, and the `EVENT.name` brand name are plain strings
    in every seed file, on purpose.
  - **Announcements are the one deliberate exception**: `announcement.title`
    /`.body` (both the seed `INITIAL_ANNOUNCEMENTS` and anything sent later
    via Manage Announcements) are *never* wrapped in `{ en, cs }` and never
    passed through `localize`. An announcement is a message sent at a point
    in time in whatever language the admin typed it in — retroactively
    translating "already sent" announcements would misrepresent what was
    actually communicated, so don't add bilingual support there even though
    the pattern would technically fit.
  - Grouping/filtering sessions by day must group by `localize(s.day)`, not
    `s.day` — the raw value is now an object, so `new Set(sessions.map(s =>
    s.day))` would treat every session as a distinct group. See
    `ProgramScreen`, `RegisterScreen`, and `ParticipantEditorModal` for the
    pattern. Any `useMemo` that calls `localize` inside it must list
    `language` in its dependency array — `sessions` alone won't change
    reference when only the active language changes, so the memo would go
    stale on a language switch otherwise.
- Role values (`Attendee`/`Speaker`/`Press`/`Organizer`) are stored and
  compared in English internally (matching, filtering, CSV export) — only
  their *displayed* label goes through `t(\`roles.${role}\`)`. Don't
  translate the stored value itself; it'd break every place that compares
  against the literal English string.
- **Every bilingual text field is edited as two mandatory inputs, not one.**
  `src/components/BilingualField.js` renders an English box and a Czech box
  side by side (stacking on narrow/phone widths via `flexWrap` + a
  `flexBasis` on each column) for exactly one content field, and every
  editor that touches bilingual content — `SessionEditorModal`,
  `SpeakerEditorModal`, `ManageOrgInfoScreen`, `ManageEventScreen`,
  `MaterialEditorModal`, and the "Send announcement" composer in
  `ManageAnnouncementsScreen` — uses it instead of a single `TextInput` per
  field. `src/utils/bilingual.js` has the two helpers this depends on:
  `toBilingual(field)` normalizes a field into `{ en, cs }` for editing
  (passes an existing bilingual object through, and — for content saved
  before this existed — duplicates a legacy plain string into both boxes as
  a starting point so the admin can then diverge the Czech one into an
  actual translation), and `isBilingualFilled(field)` requires both sides
  non-empty after trimming. Every save handler checks
  `isBilingualFilled(...)` for each bilingual field and refuses to save
  (via `Alert.alert(t('common.bothLanguagesRequired'))`) until all of them
  pass — there is no path to saving a session, speaker, org-info field,
  event detail, material, or announcement with only one language filled
  in. `ManageOrgInfoScreen`'s `accommodation` (array of hotels) and
  `instructions` (array of bullet points) are each edited as two textareas
  (one per language, same "one per line" format admins already know) and
  reassembled on save — see `buildAccommodation`/`parseLines` in that file
  for exactly how the two columns are zipped back together.
- **Announcements are bilingual too, going forward — but only going
  forward.** `addAnnouncement`'s `title`/`body` are now `{ en, cs }`
  objects like every other content field, and every display site
  (`AnnouncementCard`, `AnnouncementsScreen`, `ManageAnnouncementsScreen`)
  reads them through `localize()`. Announcements sent *before* this change
  (including the seed `INITIAL_ANNOUNCEMENTS`) are still plain strings in
  storage — `localize()` passes a plain string through unchanged regardless
  of which language is active, so those keep displaying exactly as
  originally written, in whichever language they were sent in. Don't
  "fix" that by migrating old announcements to `{ en, cs }` — a
  message is a record of what was actually communicated at the time; only
  the *compose* flow for new announcements requires both languages, never
  a rewrite of history.
- Adding a language: create `src/i18n/<code>.js` mirroring `en.js`'s keys,
  import and register it in `TRANSLATIONS` in `src/i18n/index.js`, add an
  entry to `LANGUAGES` with a `nativeName` (shown in that language, not the
  currently active one, so people can find their language even when the UI
  is currently in a language they can't read), and add a `<code>` key to
  every bilingual seed-data field in `src/data/`.

## AsyncStorage persists across code updates — this is expected, not a bug

Storage is tied to the device/browser, not the app's code. Pulling a new
version of this project does not clear it. This is *why* old test
registrations from earlier iterations of this app kept reappearing — surface
this explanation again if it comes up, and point to Manage Participants
(admin) for viewing/deleting individual accounts, or clearing
browser site data / reinstalling Expo Go for a full wipe.

## Where things live

- `src/context/AppContext.js` — single source of truth for all state and the
  only place mutations should be guarded/persisted.
- `src/navigation/index.js` — auth-gated root: renders `AuthStackNavigator`
  until `isAuthenticated`, then `MainTabs`. Admin tab is conditionally
  rendered based on `hasAdminAccess`.
- `src/screens/` — one file per screen; admin screens each independently
  guard on `hasAdminAccess` with a "restricted" fallback (defense in depth —
  the tab itself already hides them, but don't remove the in-screen guard).
- `src/components/` — shared UI: `ConfirmModal`, `SessionCard`,
  `AnnouncementCard`, the `*EditorModal` components used for add/edit flows.
- `src/utils/export.js` — CSV export, fully local today; has a commented
  `exportParticipantsToServer()` stub showing where a future backend call
  would go.

### Every piece of app content is admin-editable — nothing left hardcoded

`src/data/*.js` are **seed values only**, loaded into `AppContext` state on
first run and never read directly by any screen after that (only
`AppContext.js` itself imports them). Every screen reads the *context*
copy (`event`, `sessions`, `speakers`, `orgInfo`, `materials`, `sponsors`,
`termsText`, `announcements`), which is what admin edits actually mutate and
what gets persisted to AsyncStorage. If you ever find a screen importing
straight from `src/data/`, that's a bug — it means that screen shows the
seed forever and ignores whatever the admin sets in the app. The one
intentional exception is `src/data/announcements.js`'s
`INITIAL_ANNOUNCEMENTS`, which is just the seed for the `announcements`
list, same as everywhere else — the exception is that individual
announcement bodies are never converted into `{ en, cs }` objects (see the
Internationalization section above).

Content domains and their admin screens: `ManageEventScreen` (conference
name/dates/location/tagline + the Terms of Participation shown at
registration — combined into one screen since both are "conference
identity" rather than venue logistics), `ManageProgramScreen` (sessions),
`ManageSpeakersScreen`, `ManageOrgInfoScreen` (venue/directions/parking/
catering/etc.), `ManageMaterialsScreen` (the documents list on the Info
tab), `ManageSponsorsScreen` (the cycling sponsor banner — name, an
optional logo image, and a hex badge color; no bilingual fields since
sponsor names aren't translated), `ManageAnnouncementsScreen`, and
`ManageParticipantsScreen`. All follow the same list-screen +
`*EditorModal` bottom-sheet + `ConfirmModal` delete pattern; a new content
type should too.

### Sponsor logos: upload, resize, and the web/native color-detection split

`SponsorEditorModal` lets an admin upload a logo via `expo-image-picker`,
which `expo-image-manipulator` immediately resizes to a fixed 240px width
(aspect ratio preserved) and re-encodes as a base64 PNG — stored directly
on the sponsor record (`sponsor.image`, a `data:image/png;base64,...`
string) in AsyncStorage, the same "everything persists locally, no
backend" pattern as every other piece of content in this app. PNG (not
JPEG) is deliberate: it preserves transparency, so a logo with no
background still sits naturally on the sponsor's own badge color behind
it. `SponsorBanner` renders that image with `resizeMode="contain"` filling
*all* the space the banner has left after its "Sponsored by" label — the
full sidebar strip on web (both width and the sidebar's full screen
height), the full top-bar height and remaining width on mobile — with the
sponsor's own color as that whole area's background, not just a small
fixed badge floating inside a mostly-empty banner. `SponsorContent` in
that file is the split point: the image-fill styles (`verticalFill`/
`horizontalFill`, both `flex: 1`) and the plain-text badge styles
(`badge`/`verticalBadge`/`horizontalBadge`) are kept as entirely separate
style objects rather than merged/overridden, specifically so the `flex: 1`
and `width: '100%'` meant for the image case can't leak into the small
fixed-size text badge through RN's array-style merging. Sponsors with no
image (the seed data, and anything added without uploading one) fall back
to that original small colored badge + name text exactly as before —
`image` is optional and additive, never required.

Auto-detecting the badge color from the uploaded image
(`src/utils/imageColor.js`, `averageColorFromImage`) **only runs on
web**, using an actual `<canvas>` + `getImageData` to average the image's
pixels — deliberately, not an oversight. Getting real pixel data on the
iOS/Android app would need either a native color-extraction module (which
would require a custom Expo dev build, breaking this app's "works in Expo
Go, no dev build" setup — the same reason `expo-camera` was chosen the way
it was) or `expo-gl`-based texture sampling, which is a lot of additional
surface area for a prototype feature. On native, admins still upload and
resize the image the same way; they just set the badge color by hand with
the existing hex field underneath, which stays editable (and stays the
final source of truth) on every platform regardless of whether
auto-detection ran. Don't add a native image-color library to close this
gap without first checking it doesn't need a custom dev client — that
would reintroduce exactly the tooling/admin-permission friction this
project has been built to avoid.

What's deliberately **not** exposed through the admin UI, and why: brand
colors (`#4D92CF`/`#4F5D1B` in every `StyleSheet.create`), navigation tab
labels' *code paths* (the `nav.*` translation keys themselves, as opposed
to content those screens display), and the `src/i18n/en.js`/`cs.js`
dictionaries are all interface/theming decisions, not runtime content — an
admin panel that let someone repaint the app or rewrite its button labels
would be a themeable-app feature, a materially different (and much larger)
thing than a content-management panel, and isn't what was built here.

## What's explicitly out of scope (see README for the full list)

No backend — everything is local-device storage only, nothing syncs between
users' devices. Passwords are plain text. Admin credentials are hardcoded in
the client. All of this is documented and intentional for a prototype; don't
"fix" it piecemeal without understanding it's part of a larger, already-
planned backend migration described in the README's "What I'd build next."
