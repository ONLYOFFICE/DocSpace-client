# Proposal

## Why

Private rooms are mixed into the Rooms list today, and the only place that shows nothing but private rooms is the "Rooms E2E" app: an iframe of the SDK page `/sdk/private`. That page runs its own encryption shell, so it reaches neither the client's key management, editor nor menus. Form filling rooms had the same problem and were moved into a dedicated "Forms" section of the left panel. Private rooms need the same treatment, built natively in the client, so that encrypted rooms have one home that uses the client's own encryption flows.

## What Changes

- A new top-level **Private** section in the client sidebar (`Common:Private`), placed after Forms and before AI Agents, with one sub-item, **Archive**. Addresses: `/private/filter`, `/private/{roomId}/filter`, `/private/archived/filter`, `/private/archived/{roomId}/filter`.
- The section is available while the `privateRooms` opt-in is set and the `e2e-rooms` app is on for the portal. This mirrors Forms, which is shown while the `ai-forms` app is on.
- The section lists rooms with `searchArea=Active&privacyFilter=Private`, and its Archive with `searchArea=Archive&privacyFilter=Private`. While the section is available, Rooms and Rooms → Archive add `privacyFilter=NotPrivate`, so every private room is listed in exactly one place. Without the section, Rooms lists private rooms exactly as today.
- A private room, and any folder inside it, opens under `/private/...` from every entry point: the sidebar highlights Private, and the header title, breadcrumb root and Location column read Private.
- Private rooms are created from the section only. Its create buttons open the create-room dialog directly on the Private type, with the existing key-generation and secure-context checks. The generic room-type chooser no longer offers the Private card.
- Section-specific UI: no room-type filter, no third-party storage filter and no room groups. The section also gets its own empty state, info panel support, and live updates that respect the split.
- **BREAKING** (tester-facing, behind the flag): the iframe page behind `/e2e-rooms` is removed. `/e2e-rooms` and `/e2e-rooms?section=archive` redirect to the section, and the app launcher opens the section.
- The E2E suite enables the flag for every page, so the new sidebar item appears in every screenshot that shows the sidebar, and those baselines are regenerated.

## Capabilities

### New Capabilities

- `private-rooms/sidebar-section`: the Private section of the client sidebar. It covers when the section is available, its addresses and sub-items, the Rooms/section split of the rooms lists, opening private rooms inside the section, creation from the section, and the section's header, filter, empty state, info panel and live updates. It also records the v1 limitations of a client-only section (no Recent/Favorites/Trash, no new-items counter).

### Modified Capabilities

- `private-rooms/feature-gating`:
  - "Private room card is gated in the create-room chooser": creation is offered only through the section.
  - "Flag is read on demand": the section is fixed per page load, like the route tables.
  - "E2E rooms app is gated as an unreleased app": the app now stands for the section, and the iframe page is gone.
  - "Existing private rooms stay visible without the flag": states where private rooms are listed with and without the section.
- `private-rooms/room-membership`:
  - "Private room is a flagged Custom room" and "Private rooms need a secure context": creation starts from the section.
  - "Choosing the Private card without a key starts key generation": creation starts from the section, and the requirement is renamed to "Starting private room creation without a key starts key generation".
  - "Navigation into the new private room": the new room opens under the section.
  - "Standard room management stays available": an archived private room appears in Private → Archive.
- `private-rooms/sdk-surface`: "Client app embeds the SDK surface" is removed; the SDK pages themselves are unchanged.
- `private-rooms/server-contract`: new requirements that record what the client now relies on:
  - the `privacyFilter` parameter of the rooms list, and that it drops third-party rooms for `Private`;
  - private rooms of other users are not listed to administrators;
  - private rooms have no root folder or search area of their own.

## Impact

- Client:
  - sidebar (`packages/client/src/components/ClientArticleSidebar`);
  - routes (`packages/client/src/routes/client.js`) and route helpers (`packages/shared/utils/common.tsx` `getCategoryType`, `packages/shared/constants` `CategoryType`, `packages/client/src/helpers/{utils.js,articleNavigation.ts}`);
  - rooms fetching (`packages/client/src/store/filesStore/{fetch,socket}.helpers.ts`, `packages/client/src/pages/Home/Hooks/useFiles.ts`);
  - the Home section header, filter and body;
  - the empty views; the info panel store;
  - the create entry points (`Article/MainButton`, `CreateButtonMobile`, `helpers/getSectionCreateButton.ts`, `ContextOptionsStore`, `CreateEditRoomDialog`);
  - `packages/shared/utils/rooms.tsx` (`getCreateRoomTypes`), `helpers/disabled-apps.ts`, the Dashboard module launcher;
  - removal of `packages/client/src/pages/E2eRooms`.
- Locales: new keys in `public/locales/en/Common.json` (`PrivateRooms`) and `packages/client/public/locales/en/EmptyView.json`, translated to every supported language.
- Tests:
  - client store unit tests for the request scoping and the route helpers;
  - a new Playwright spec `private-rooms-section.spec.ts`;
  - updates to `private-rooms-hidden.spec.ts` and the private-room specs that open rooms under `/rooms/shared`;
  - regenerated sidebar screenshots across the suite (Docker).
- Server (`../server`): **no work required**. The change relies on behaviour already on `hotfix/v4.0.1`:
  - `privacyFilter` on `GET api/2.0/files/rooms` (`RoomContentRequestDto.cs:129-130`, `FolderDao.cs:2479-2484`);
  - third-party rooms dropped for `Private` (`FileSecurity.cs:2916`);
  - private rooms created under the VirtualRooms root (`FileStorageService.cs:669`).
- Document Server: none. Buildtools: none, since nginx already serves `/private` to the client through `location /`.

## Out of scope

- A server-backed section like Forms: a root folder type, a `SearchArea` value, an `@root` entry, a new-items counter, and Recent/Favorites/Trash scoped to private rooms. This needs backend work. It is listed as a follow-up in design.md and is not specified here.
- The SDK private surface `/sdk/private*` and the SDK rooms list.
- Room pickers (move/copy/"share to room" selectors), the default start page setting, tours, and a Dashboard card for the section (none exists today).
- Releasing the feature or replacing the opt-in (`private-rooms-release-gate`).

## Coordination with in-flight changes

- `private-rooms-sdk-gating-and-parity` has these items built on the iframe page this change removes:
  - task 1.3 appends the opt-in to the client iframe;
  - the scenarios "Client passes its flag" and "Client iframe".

  Both changes must be reconciled with `/opsx:update` before either is applied (task 0.1 here).
- `private-rooms-release-gate` removes the feature-gating requirements this change modifies, by name, and its scenarios still speak of "the E2E rooms app". Its delta must be revised when it is picked up, so that the section rules from `private-rooms/sidebar-section` survive the release.

## Decisions needed

Already decided with the user:
- client-only approach;
- the section replaces the E2E rooms app;
- Archive is the only sub-item;
- the route is `/private`;
- the section is labelled "Private" (`Common:Private`) in the sidebar and the header;
- the section sits after Forms and before AI Agents.

Still open:
1. The apps catalog keeps its own title, "Rooms E2E" (`Common:DashboardE2eRoomsTitle`). Renaming it to match the section, as Forms did, is a separate wording decision and is not part of this change.
2. Whether to request the server-backed section from the backend team as a follow-up change. That would add a counter and scoped Recent/Favorites/Trash.
