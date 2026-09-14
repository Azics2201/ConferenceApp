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
- Scope boundary: only interface chrome is translated (labels, buttons,
  headers, alerts, validation messages). Admin-entered *content* — session/
  speaker/org-info text, announcement bodies, the Terms of Participation
  (`src/data/terms.js`) — stays in whatever language the admin typed it in;
  translating that would need a real multi-locale content model, which this
  prototype doesn't have. Role values (`Attendee`/`Speaker`/`Press`/
  `Organizer`) are also stored and compared in English internally (matching,
  filtering, CSV export) — only their *displayed* label goes through
  `t(\`roles.${role}\`)`. Don't translate the stored value itself; it'd break
  every place that compares against the literal English string.
- Adding a language: create `src/i18n/<code>.js` mirroring `en.js`'s keys,
  import and register it in `TRANSLATIONS` in `src/i18n/index.js`, and add an
  entry to `LANGUAGES` with a `nativeName` (shown in that language, not the
  currently active one, so people can find their language even when the UI
  is currently in a language they can't read).

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

## What's explicitly out of scope (see README for the full list)

No backend — everything is local-device storage only, nothing syncs between
users' devices. Passwords are plain text. Admin credentials are hardcoded in
the client. All of this is documented and intentional for a prototype; don't
"fix" it piecemeal without understanding it's part of a larger, already-
planned backend migration described in the README's "What I'd build next."
