# TechConnect — Conference Companion App (Expo SDK 55)

A React Native / Expo prototype covering full conference-app requirements: registration with
consent and session picks, a program/speakers/venue information section, organizer-managed content
and targeted announcements, and QR-code digital badges for check-in.

## What's implemented

**Authentication**
- The app shows a Welcome screen with three options before any content is visible: **Register**,
  **Log in**, and **Administrator login** (the admin option only appears when running on **web** —
  see "Admin is web-only" below).
- Registering creates an account (with a password) and, after viewing your confirmation/badge
  screen, signs you in.
- **Log in** — email + password. Multiple accounts (multiple registrations) can exist on the same
  device; log out and log in with a different email to switch accounts.
- **Administrator login** — a separate username/password form. For this prototype, the hardcoded
  credentials are **username `admin`, password `admin`**.
- Wrong credentials on either login form show an inline error message under the fields (no popup).
- No tab content is reachable until you're logged in as either a participant or an administrator.
  Logging out (from the Home tab) returns you to the Welcome screen.

> **Admin is web-only.** The "Administrator login" option is hidden on iOS/Android entirely, and
> `loginAdmin()` also rejects on native even if somehow reached (defense in depth, not just a
> hidden button). Registered participants never see, and can never reach, any admin capability —
> `hasAdminAccess` is checked inside every admin mutation in `AppContext.js` (posting an
> announcement, editing the program/speakers/org info, deleting or editing a participant, recording
> a check-in), not just in the screens that expose the buttons for them. This was a real bug in an
> earlier version — any logged-in participant could post announcements — now fixed at the source.

> **Sub-admins.** An admin can grant a specific participant account admin access ("Grant
> administrator access (sub-admin)" checkbox when adding/editing them in Manage Participants).
> That person then gets full Admin tab access using their own email/password login instead of the
> shared admin/admin login — useful for actual organizers who need to help run the event. Sub-admin
> access is subject to the same web-only rule as the main admin login. Internally, `hasAdminAccess`
> is `true` for either the hardcoded admin session *or* a logged-in participant with
> `isSubAdmin: true`, and it's this combined flag — not the narrower `isAdminSession` — that every
> admin action actually checks.

> **Security note:** passwords are stored in plain text in local device storage and the admin
> credentials are hardcoded in the client bundle — both are fine for a demo/prototype but must
> never be done this way in a real deployment. See "What I'd build next."

> **Cross-platform note:** every destructive confirmation (log out, delete a session/speaker/
> participant) uses a custom in-app confirm dialog (`src/components/ConfirmModal.js`) rather than
> `Alert.alert` with multiple buttons. React Native's multi-button `Alert.alert` doesn't reliably
> fire per-button callbacks on web (it depends on the browser's `window.confirm`, which doesn't map
> cleanly onto that API), so any *new* confirmation you add for an action that matters should reuse
> `ConfirmModal` rather than `Alert.alert`.

**Registration**
- Form fields: first/last name, organization, job title, email, phone, role, which sessions you plan
  to attend, free-text notes for the organizer, and special requests (dietary/accessibility/other).
- Terms of Participation & Personal Data Processing notice — must be read and accepted (checkbox)
  before the form can be submitted (`src/data/terms.js` — replace with your organization's real,
  legally-reviewed text before any real-world use).
- Confirmation screen shown immediately after registering, including your QR badge.

**Information**
- **Program** — sessions grouped by day, with title, time, room, and linked presenter(s). Sessions
  you're registered for are visually highlighted (green tint + "You're signed up" badge) — this is
  separate from the star/favorite toggle, which is just a personal bookmark.
- **Speakers** — bio and their sessions.
- **Info tab** — venue, map, directions, parking, public transportation, accommodation options,
  organizer contact, catering, important instructions, additional info, and downloadable materials.

**Admin tab (web only, admin or sub-admin login only)** — a dedicated bottom tab labeled "Admin"
that only appears once you're logged in with admin access. It no longer lives behind a button on
the Home screen:
- **Manage participants** — overview of everyone registered on this device, with a search box
  (name/email/organization), a role filter, each participant's selected sessions shown inline, a
  CSV export button, and full **add / edit / delete** for participant accounts — including setting
  their role, resetting their password, and granting/revoking sub-admin access. This is also how you
  create accounts directly for staff (organizers, sub-admins, speakers) rather than requiring them
  to self-register.
- **Manage program** — add/edit/delete sessions.
- **Manage speakers** — add/edit/delete the public speaker directory (bios shown on the Speakers
  tab) — a separate thing from a person's login account; see note below.
- **Manage organizational info** — edit venue/parking/catering/contact/etc.
- **Announcements** — the full, unfiltered history of every announcement ever sent, plus the
  compose tool. This always shows everything regardless of what audience a given announcement was
  targeted to — audience targeting is a label shown to participants, not a filter on what the admin
  sees. Participants only ever see a read-only version of this same list on the Updates tab; sending
  now lives exclusively here in the Admin tab.
- **Check-in scanner** — uses the device camera to scan a participant's badge QR code and record
  attendance.

> **Two different "speaker" concepts, on purpose.** The public **Speakers tab** (bios shown to
> everyone) and a participant **account** with role "Speaker" are separate data models — adding one
> doesn't automatically create the other. Manage Participants creates/edits login accounts (any
> role, including Speaker); Manage Speakers creates/edits the public bio entries people see. For a
> real speaker, you'd typically do both. A natural next step would be linking them together — see
> "What I'd build next."

> **This admin panel is already "web-based."** Since the whole app is built with Expo, running
> `npx expo start --web` (or pressing `w` in the terminal, or Docker's web command) opens the exact
> same organizer tools in a real browser — nothing extra to build or deploy separately. Log in with
> the admin credentials there the same way you would on a phone.

**Exporting participant data**
- The Manage Participants screen exports whatever is currently visible (respecting your search/
  filter) as a CSV file — on web this triggers a normal browser download; on a phone/emulator it
  writes a temporary file and opens the native share sheet so you can save or send it.
- This works entirely offline/locally, as requested. The export code (`src/utils/export.js`) is
  structured so a future server sync is a small addition: `buildParticipantsCSV()` is a pure
  function already separated from the local-delivery mechanism, and there's a commented
  `exportParticipantsToServer()` stub showing the shape that call would take once a backend exists.
- The export deliberately **excludes password fields** — never include credentials in an export.

**Why old test registrations are still showing up, and how to remove them**
- This app stores its data using AsyncStorage, which is your device's (or browser's) local storage
  — the same mechanism a browser uses to remember things across page reloads. It's tied to your
  device/browser, **not to the app's code**. Every time you update to a new version of this project
  and reload it, that storage is untouched — so every test account you've ever registered while
  trying earlier versions has been quietly accumulating there.
- **To see and remove them:** log in as administrator → Organizer Tools → Manage Participants. Every
  account ever registered on this device/browser will be listed there, regardless of which version
  of the app you were using when you created it. Use the trash icon on any row to delete it.
- **To wipe everything at once** instead of one at a time: on web, clear the site's storage from
  your browser's dev tools (Application → Storage → Clear site data) or just use a private/incognito
  window for a clean slate; on a phone, clearing Expo Go's app data (or uninstalling/reinstalling it)
  does the same.

**Digital badge (QR code)**
- Generated automatically on registration, encoding the participant's ID, name, organization, and
  role. View it any time from Home → "View my badge."

> **Important caveat for this prototype:** there's no backend — organizer access is gated only by
> the hardcoded admin/admin login (fine for testing, not for real use), and all data (accounts,
> program edits, announcements, check-ins) lives only in local device storage, not shared between
> devices. See "What I'd build next" below for how this becomes a real multi-user system.

## Stack

- **Expo SDK 55** (React Native 0.83, React 19.2)
- **React Navigation** (bottom tabs + `@react-navigation/stack` — the JS-based stack, chosen
  specifically because `@react-navigation/native-stack` doesn't render on web)
- **AsyncStorage** for on-device persistence
- **expo-notifications** for the local-notification announcement demo
- **expo-camera** for the organizer check-in scanner
- **react-native-qrcode-svg** + **react-native-svg** for badge QR codes

> **Web scrolling fix (two separate issues, both fixed):**
> 1. `App.js` sets `height: 100%` on `html`/`body`/`#root` on web. Metro's default web template
>    (unlike the older webpack template) doesn't do this itself, and without it, top-level scroll
>    containers never get a bounded height to scroll within.
> 2. Every `createStackNavigator` in `src/navigation/index.js` sets `screenOptions={{ cardStyle: {
>    flex: 1 } }}`. `@react-navigation/stack` wraps each screen in a transition "card" container
>    that doesn't reliably inherit a bounded height on web on its own — this is *separate* from
>    fix #1 above, and is why Register/Login/Badge/every Admin screen (all stack-nested) could still
>    fail to scroll even after the first fix was in place, while the plain bottom-tab screens
>    (Home/Program/Info) already scrolled fine. If you add a new stack navigator later, it needs
>    this same option or its screens will hit the same bug.

## How to run it

```bash
npm install
npx expo install --fix   # let Expo verify/pin every dependency for SDK 55 specifically
npx expo start
```

> **Note on dependency versions:** most packages in `package.json` are left unpinned (`"*"`)
> rather than guessed at exact version numbers. `npx expo install --fix` is what actually resolves
> and writes in the correct versions for your installed Expo SDK — that's the authoritative source,
> not any specific number written in this file. If `npm install` ever fails with an `ERESOLVE` peer
> dependency error, that's a sign a version got hand-pinned somewhere it shouldn't have been; the
> fix is the same either way: delete `node_modules` and `package-lock.json`, then run
> `npx expo install --fix` directly (skip plain `npm install` first) — it corrects the versions in
> `package.json` as part of what it does, before installing, so it won't hit the same conflict.
>
> **Exception: `react` and `react-dom` must always be pinned to the exact same version as each
> other**, never left as `"*"` independently — that's a hard React rule, not an Expo one. If they
> drift apart (e.g. `"*"` resolves `react-dom` to a newer release than the `react` version pinned
> for this SDK), `npm install` fails with an `ERESOLVE` peer conflict between them specifically.

Then scan the QR code with **Expo Go** on your phone (make sure Expo Go on your phone is also on
SDK 55 — see "SDK version notes" below), press `a`/`i` for an emulator/simulator, or press `w` for
the browser.

If you don't have Node.js installed and can't install it (e.g. no admin rights), see the portable
Node / Docker setup notes from earlier — same approach applies here, just re-run
`npx expo install --fix` once after fetching this version so all sub-dependencies get re-pinned for
SDK 55.

### SDK version notes

Expo Go (as distributed via the App Store / Play Store) generally supports only the **current**
SDK version at a time. If your phone's Expo Go doesn't match SDK 55, you'll get an "incompatible"
error or a QR code that won't connect. This is a development-time issue only — it has no effect on
how complete or functional the finished app is; it only affects live preview during development.
See `expo.dev/go` for installing a specific SDK version of Expo Go on Android/emulators (iOS
physical devices are restricted to whatever the App Store currently offers).

## Importing into Expo Snack

Snack doesn't support uploading a zip directly — it only reads a `package.json` you paste in
directly, or imports from a public GitHub repository.

**Two hard-won lessons from getting this into Snack before:**
1. **If you push this to GitHub for import, exclude `node_modules/`, `.expo/`, and any
   `.node-portable/` folder** — dragging a full local copy into GitHub's web uploader includes these
   and breaks Snack's importer with a cryptic "failed to upload file asset" error. Only the actual
   source files listed above should be in the repo.
2. **`package.json` dependencies must exactly match packages Snack can resolve.** Tunnel-only tools
   like `@expo/ngrok` (irrelevant inside Snack anyway) will fail with "Failed to fetch." If you hit
   dependency errors in Snack, delete `package.json` from the Snack file list entirely and add each
   package individually through Snack's own **Dependencies** panel on the left instead — that lets
   Snack pick versions it has already verified work in its sandbox.
3. **Snack itself may lag a version or two behind the very latest SDK.** If Snack doesn't yet offer
   SDK 55, use its SDK-version selector to pick the closest supported version for browser-preview
   purposes; full device testing still needs your local setup running the real SDK 55 build.

## Trying it out

1. **Welcome screen** → tap Register → fill out the form, set a password, pick a few sessions,
   accept the terms → submit. You land on a confirmation screen with your QR badge; tap
   "Done — log me in" to enter the app.
2. **Program** → notice the sessions you picked during registration are highlighted (green tint +
   "You're signed up" badge) — separate from the star icon, which is just a personal bookmark.
3. **Home** → note the "Log out" link — tap it, and you're back at the Welcome screen. Log back in
   with the same email/password, or register a second account to see account-switching.
4. Try logging in with a **wrong password** — an error message appears under the password field.
5. From the Welcome screen (on **web** only — this option doesn't appear on a phone), tap
   **Administrator login** → use `admin` / `admin`. Try a wrong password first to see the inline
   error, then the correct one.
6. Once in as admin, notice a new **Admin** tab has appeared in the bottom bar alongside Home,
   Program, Speakers, Info, and Updates. Open it → **Manage Participants**:
   - Search, filter by role, and see each participant's selected sessions listed inline.
   - Tap **"+ Add person"** to create an account directly — fill in their details, set a role
     (e.g. Organizer), and check **"Grant administrator access (sub-admin)"**. Save, then log out
     and log back in as that person (their email/password, not admin/admin) — they land on the
     regular registered-participant Home screen, but with a note that they also have admin access,
     and the Admin tab is there for them too.
   - Tap the edit icon on any participant to change their role, reset their password, adjust their
     session picks, or toggle sub-admin access.
   - Try deleting a test registration (including any leftover ones from earlier versions you
     tested — they'll be listed here too).
7. From Manage Participants, tap **Export CSV** — on web it downloads a file; on a phone it opens
   the share sheet.
8. Try editing a session, adding a public speaker bio, or updating the venue description from the
   other organizer tools.
9. **Program / Speakers / Info / Updates** work the same regardless of whether you're logged in as
   a participant or an administrator — Updates is now a read-only feed for everyone.
10. From the Admin tab, open **Announcements** → send one, choosing an audience. Notice this screen
    always shows the complete history regardless of audience filtering; participants see the same
    full list (read-only) on their Updates tab.
11. Open the check-in scanner (admin only) and point it at another device showing a participant's
    badge QR code (or a printed copy) to see a check-in recorded.

## What I'd build next

1. **Real backend authentication.** Passwords are currently stored in plain text on-device and the
   admin login is a hardcoded client-side check — neither is remotely safe for real use. A backend
   would hash/salt passwords server-side, issue session tokens, and handle admin auth via a proper
   identity system (not a shared password baked into the app).
2. **Server-synced participant data & export.** The CSV export already works fully offline; the
   natural next step is having the admin panel pull from (and push to) a real API instead of local
   storage, so registrations, edits, and deletes are consistent across every organizer's device, not
   just the one they're using. `src/utils/export.js` has a stubbed `exportParticipantsToServer()`
   showing where that call would go.
3. **Real audience targeting for notifications.** The audience picker in the announcement composer
   is fully built, but without a backend there's no way to actually filter *which devices* receive
   a push — that filtering logic is what the backend would apply against stored push tokens.
4. **Attendance reporting.** Once check-ins are recorded server-side, add an organizer dashboard
   showing check-in rates per session, no-shows, etc.
5. **Password reset / forgot password flow**, since right now there's no recovery path if someone
   forgets their password other than registering a new account with a different email.
6. **Session capacity & waitlisting**, since attendees can currently "select" a session with no
   limit on how many can pick it.
7. **Link staff accounts to public speaker profiles.** As noted above, creating a participant
   account with role "Speaker" and adding their public bio via Manage Speakers are currently two
   separate steps with no relationship between the records. A real system would let admin link
   them — or auto-create the public bio stub when a Speaker-role account is added — so they don't
   drift out of sync.
8. **Server-synced sub-admin permissions.** Sub-admin status currently lives on the same local
   account record as everything else; in a real backend this would be a proper role/permission
   grant, auditable and revocable centrally rather than trusted from whatever's in local storage.
