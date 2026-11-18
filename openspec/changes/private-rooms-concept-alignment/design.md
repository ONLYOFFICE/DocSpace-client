# Design

## Context

See proposal.md, "Why". The variant comes from two documents kept outside
the repository: the canvas "Private rooms: redesign options" of 2026-11-18
(release, stand and the chosen variant side by side, in both themes) and
the design review of the concept of 2026-11-17. The code matches neither
yet: this change is the first to build the variant. The decisions of
`private-rooms-key-ux-refresh` and `private-rooms-release-ux-fixes`
(archived 2026-11-17) stay in force and bound it.

What the code has today:

- The apps of the dashboard are built by one hook
  (`pages/Dashboard/hooks/useModuleItems.tsx`): Files, Rooms, Forms and,
  when the AI section exists, AI Workspace. Rooms and Forms are
  create-first cards that fall back to Common:Open, and keep a "Disabled"
  card for whoever may switch the app on. Private rooms have no card,
  although the apps catalog (`helpers/apps-catalog.tsx`) lists the app and
  the launcher (`hooks/useModuleLauncher.tsx`) opens `/private/filter`.
- The section decides its own availability
  (`AppsStore.isPrivateRoomsSectionAvailable`) and its own create entry
  points, which open the create dialog on the Private type and raise key
  setup for a user without a key.
- The header of the list (`pages/Home/Section/Header/index.js`) renders the
  key state indicator for a room and a folder inside one, not for the list.
- Keys management (`keys-management/KeysManagement.tsx`, `KeysList.tsx`)
  shows the key with its status badge, the recovery link and the device
  block. It reads the unlocked state from the encryption context to choose
  between Lock now and Forget device, and nowhere says it in words.

## Goals / Non-Goals

**Goals:**

- The three additions of the proposal, built from the kit's components and
  the texts the product already has wherever one fits.

**Non-Goals:**

- A new component in `docspace-ui-kit-react`. If a piece cannot be built
  from what the kit has on `release/v4.1.0`, the task stops and says so.
- Any change of the SDK private pages.

## Decisions

1. **The card is one more item of the dashboard hook.** It is built like
   the Rooms card: `withInstallState` over `createOrOpen`, with the
   installed state read from the apps store for the E2E rooms app and the
   whole card dropped when the section is not available to the user. It
   takes its place after Forms. It sets `noTour`, as the AI Workspace card
   does: the section has no onboarding tour (main spec, "No onboarding
   tour in the section").
2. **Creation starts in the section, not on the dashboard.** The button
   leaves a request in the memory of the page and navigates to
   `/private/filter`, and the list, once shown, takes the request and
   starts its own create entry point. The request is kept outside the
   navigation state, which the list rewrites while it settles its filter,
   and lives for a few seconds only. The dashboard never dispatches the create-room event for the
   Private type: the main spec keeps that type out of every chooser opened
   outside the section, and the section already handles a user without a
   key. Alternative considered: dispatch the event from the dashboard with
   the Private type preset, as the Forms card does for a form room.
   Rejected: it would be a second place that has to know about key setup.
3. **The badge of the card is the shared Beta badge**, the component the
   sidebar item uses, with its title and description options. The card
   model gets an optional slot for it; no other card uses it.
4. **The line of the list is part of the header title row.** It is shown
   for the root of the section and of its Archive only, takes the mark the
   room icon uses, and gives way first when the row is narrow: the title
   and the header actions do not shrink for it. On a phone width it is not
   rendered.
5. **The state on Keys management reads the encryption context**, the same
   source the room header indicator reads, so a lock from the idle timer,
   from the popover of a room in another tab of the page tree or from the
   page itself shows at once. It is a text mark beside the heading, not the
   interactive indicator of the room header: the page already holds the
   actions the popover offers.
6. **The unlock action calls the shared unlock**, `requireIdentity` of the
   encryption context, as the locked-key block of a room does. A dismissed
   dialog changes nothing on the page.
7. **Colours come from tokens.** The mark uses the status colours of the
   existing key status badges (`keyStatusBadgeColors.ts`), extended if a
   locked state needs a pair of its own; no hex in components.
8. **Three new keys, no rewording of existing ones.** The texts of the
   stand that differ from the release only in wording are not taken; a
   change of an approved text is a change of its own.

## Risks / Trade-offs

- [The dashboard screenshot matrix has a frame for every role, edition and
  AI state, and each frame of a portal with the section gains a card] →
  the matrix gets the section as a condition of its mocks, the frames are
  retaken under Docker with `--update-snapshots=changed`, and the diff is
  read before it is committed: only the apps grid may differ.
- [Four cards become five where AI is on, so the grid wraps a row earlier]
  → accepted; the stand wraps the same way.
- [The line of the list is a third place that states the encryption, after
  the empty state and the room panel] → it is the only one visible on a
  list that holds rooms.
- [The request outlives a navigation that never reaches the list] → it
  expires after a few seconds, is taken once, and is dropped for a user who
  cannot create rooms. A reload of the page loses it, which is the wanted
  result.

## Open Questions

- Whether the frames that show the icons replaced on 2026-11-18 are retaken
  in this change or before it. They are retaken here unless somebody does
  it first; either way the diff of task 4.2 names them apart.
