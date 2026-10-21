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
- The product name changes from "Rooms E2E" to "Private" everywhere it is shown: the apps catalog entry and the header of the SDK private rooms list use `Common:Private`, like Forms uses `Common:Forms` in both places. The `Common:DashboardE2eRoomsTitle` key is then unused and is removed from every language. The app id `e2e-rooms` and its description stay.
- The E2E suite enables the flag for every page, so the new sidebar item appears in every screenshot that shows the sidebar, and those baselines are regenerated.

## Capabilities

### New Capabilities

- `private-rooms/sidebar-section`: the Private section of the client sidebar. It covers when the section is available, its addresses and sub-items, the Rooms/section split of the rooms lists, opening private rooms inside the section, creation from the section, and the section's header, filter, empty state, info panel, live updates and apps catalog title. It also records the v1 limitations of a client-only section (no Recent/Favorites/Trash, no new-items counter).

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
- `private-rooms/sdk-surface`: "Client app embeds the SDK surface" is removed. A new requirement titles the SDK private rooms list `Common:Private`; the SDK pages are otherwise unchanged.
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
  - removal of `packages/client/src/pages/E2eRooms`;
  - the apps catalog title (`packages/client/src/helpers/apps-catalog.tsx`) and the label in the unused `components/NewArticle`.
- SDK: the list header title in `packages/sdk/src/app/(private)/private/page.client.tsx`.
- Locales: new keys in `public/locales/en/Common.json` (`Private`) and `packages/client/public/locales/en/EmptyView.json`, translated to every supported language. `DashboardE2eRoomsTitle` is removed from all 32 `Common.json` files and from `public/locales/.meta/Common`.
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
- The SDK private surface `/sdk/private*` and the SDK rooms list, apart from the title of the private rooms list.
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
- the section sits after Forms and before AI Agents;
- "Rooms E2E" is renamed to "Private" everywhere, the apps catalog and the SDK private list included;
- the server-backed sections will be requested from the backend team later. This change stays client-only; a follow-up change will move the client onto the server sections once they exist.

Nothing is left open.
