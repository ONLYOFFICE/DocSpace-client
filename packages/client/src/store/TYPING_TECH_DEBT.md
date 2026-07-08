# Store typing tech-debt

Extracted from the `.js → .ts` MobX store migration (formerly inline
`// FABLE5-REVIEW:` comments). Two kinds of follow-up:

- **Untyped `shared/api`** — the store casts the response because the shared API
  endpoint returns `unknown` / a bare `request()` / lives in a `@ts-nocheck`
  file. Fix at the source: give the endpoint a real return type in
  `packages/shared/api/...`, then drop the cast in the store.
- **Dead code** — a field/method with no consumers in the repo, or that would
  throw if ever called (dependency never assigned). Candidate for removal.

Line numbers are approximate (as of extraction) — grep the symbol to relocate.

## Untyped `shared/api` (cast at call site)

### `FilesActionsStore.ts` / `filesActionsStore/helpers.ts`
- `enableCustomFilter` — force-cast to `TOperation[]` but actually returns the updated `TFile`. (helpers.ts ~106)
- `api.rooms.pinRoom` / `unpinRoom` — untyped (`@ts-nocheck` in `shared/api/rooms`). (helpers.ts ~166)
- `startEmptyPersonal` / `getEmptyPersonalProgress` — force-cast to `TOperation[]` but return a single progress object. (FilesActionsStore.ts ~256 and ~1002)
- `finalizeVersion` — untyped (raw `request()`); should return `TFile[]`. (~1921)
- `muteRoomNotification` — untyped (`@ts-nocheck` in `shared/api/settings`). (~2219)
- `api.rooms.updateRoomMemberRole` — untyped (`@ts-nocheck` in `shared/api/rooms`). (~4200)

### `UploadDataStore.tsx` / `uploadDataStore/helpers.ts`
- `getFileConversationProgress` — untyped; `TConversionProgress` reverse-engineered from usage. (helpers.ts ~79)
- `uploadChunkParallel` / `uploadChunkSequential` / `finalizeUploadSession` — untyped; `TChunkUploadResponse` guessed from usage (also cast ~2045). (~182)
- `checkIsFileExist` — untyped; declares `folderId: number` while string ids are passed for third-party folders. (~1561)

### `DialogsStore.ts`
- `saveThirdParty` — response held as untyped; endpoint should be typed instead of `unknown`. (~346)
- `getRoomCovers` / `getRoomGroups` / `getGroupById` — return `request(options)` without a generic, forcing `as` casts. (~1334)

### `SettingsSetupStore.ts`
- `getSMTPSettings` / `resetSMTPSettings` — untyped. (~75, ~403, ~440)
- `getLoginHistory` / `getAuditTrail` — untyped. (~84, ~653, ~669)
- `getLifetimeAuditSettings` / `setLifetimeAuditSettings` — untyped; payload mismatches `TCookieSettings`. (~95, ~613)
- `getAllActiveSessions` / `removeAllActiveSessions` — untyped. (~103, ~864, ~870)
- `api.people.getListAdmins` — untyped. (~545, ~564)
- `getLoginHistoryReport` — untyped. (~684)
- `getAuditTrailReport` — untyped. (~702)
- `getConsumersList` — untyped. (~763, ~784)

### `BackupStore.ts`
- `getBackupProgress` — untyped (`request()` without a generic). (~713)

### Smaller stores
- `VersionHistoryStore.ts` — `api.files.markAsVersion` untyped; cast to `Promise<TFile[]>`. (~242)
- `PublicRoomStore.ts` — `api.rooms.getExternalLinks` untyped; cast to `Promise<TFileLink[]>`. (~203)
- `FilesSettingsStore.ts` — `api.rooms.hideConfirmRoomLifetime` untyped; cast to `Promise<boolean>`. (~766)
- `SsoFormStore.ts` — `loadXmlMetadata` / `uploadXmlMetadata` / `validateCerts` / `generateCerts` untyped raw axios calls (~76); `resetSsoForm` (`DELETE /settings/ssov2`) untyped, cast to `TGetSsoSettings` (~533).
- `OformsStore.ts` — oforms API client (`shared/api/oforms/index.js`) is `@ts-nocheck`; responses cast across `getOformLocales` / `getOforms` / `getCategoryById` / `getCategoryTypes` / `getCategoriesOfCategoryType` / `submitToGallery`. (~208)
- `StorageManagement.ts` — `getQuotaSettings` untyped (local `TQuotaSettings` covers only `lastRecalculateDate`, ~69); `checkRecalculateQuota` untyped, cast to boolean (~175).
- `LdapFormStore.ts` — LDAP endpoints untyped (`getLdapSettings`, `getLdapDefaultSettings`, `getLdapStatus`, `syncLdap`, `saveLdapSettings`, `getCronLdap`, `saveCronLdap`); move local types to `shared/api/settings/types.ts` once typed. (~24)
- `WebhooksStore.ts` — webhook API in `shared/api/settings` untyped; `TWebhook` shapes inferred from server responses. (~55)
- `CommonStore.ts` — `getGreetingSettingsIsDefault` (cast `as boolean`, ~157) and `getDeepLinkSettings` (cast on result, ~297) untyped.
- `AvatarEditorDialogStore.ts` — `api.rooms.uploadRoomLogo` untyped; cast on response. (~118)

## Dead code (removal candidates)

- `FilesStore.ts` — `currentQuotaStore` field never assigned (quota goes through `this.authStore.currentQuotaStore`). (~228)
- `FilesStore.ts` — `declare fileActionStore` never assigned; `onCreateAddTempItem` would throw if called. (~371)
- `SelectionStore.ts` — `peopleStore` never assigned; `selectAll` / `selectByStatus` would throw and have no callers. (~49)
- `AccessRightsStore.ts` — `treeFoldersStore` never assigned or read (stays `null`). (~85)
- `TreeFoldersStore.ts` — `expandedPanelKeys` has no consumers outside this store. (~75)
- `FilesSettingsStore.ts` — `setStoreForceSave` / `setForceSave` call `api.files.storeForceSave` / `forceSave`, which are commented out in `shared/api`; no consumers, would throw. (~78)
- `FilesSettingsStore.ts` — `expandedSetting` / `setExpandSettingsTree` have no consumers outside this store. (~104)
- `SettingsSetupStore.ts` — `setOptions` has no callers; option shape unknowable. (~155)
- `SettingsSetupStore.ts` — `setAddUsers` / `setRemoveAdmins` have no callers. (~193)
- `BackupStore.ts` — `backupStorage` never read or written. (~114)
- `BackupStore.ts` — `timerId` never assigned; stays `null` forever. (~174)
- `BackupStore.ts` — `connectedAccount` never read or written. (~204)
