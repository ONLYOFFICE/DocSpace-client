---
paths:
  - "packages/client/src/**"
  - "packages/shared/**"
---

# Feature-code conventions (client + shared)

## MobX stores

The root store is a hand-wired singleton **object literal** in
`packages/client/src/store/index.ts` (~55 stores, `new`-ed in dependency
order, positional constructor injection). Adding a store = create the class
(`makeAutoObservable(this)` in constructor) → `new` it in the right position →
add it to the `store` object literal (forgetting the last step makes it
invisible to `inject`). Circular deps are resolved by post-construction
assignment (`filesStore.dialogsStore = dialogsStore;`) — follow that
convention, don't reorder. Some object keys are renamed: `setup`, `confirm`,
`backup`, `common` (not `setupStore` etc.).

Component wiring — two coexisting mechanisms:

```tsx
export default inject<TStore>(({ appsStore, userStore }) => ({
  isEnabled: appsStore.isEnabled,
}))(observer(MyComponent));
```

`TStore` is a global ambient type (`packages/client/global.d.ts`), no import
needed. For **new** components prefer the hooks `useStores()` /
`useStore("dialogsStore")` from `packages/client/src/store/useStore.ts` —
but `observer(...)` remains mandatory either way.

TanStack Query is installed and provided in `App.js` but has **zero call
sites** — data fetching goes through MobX stores calling the API layer. Do
not introduce `useQuery` fetching without asking.

## API layer (`packages/shared/api`)

One folder per domain (`index.ts` + `types.ts`, `filter.ts` for paged lists).
Every call uses `request<T>()` from `packages/shared/api/client.ts`:

```ts
import { request } from "../client";
export async function getApps() {
  return (await request({ method: "get", url: "/apps" })) as TApp[];
}
```

New domain folders must be registered in the default export of
`packages/shared/api/index.ts` to be reachable as `api.<domain>`; direct named
imports are the newer style and skip that. Several modules are `@ts-nocheck` —
`packages/client/src/store/TYPING_TECH_DEBT.md` tracks endpoints with faked
return types; the fix is a real return type in the API module, then drop the
cast in the store.

## Styling — SCSS Modules only

**styled-components is fully removed** (0 imports; `*.styled.module.scss` /
`*.styled.js` files are migration leftovers, they are plain SCSS). New
components: `Component.module.scss` + `import styles from "./….module.scss"`,
combine classes with `classnames`, escape scoping with `:global(…)`.

Theming is **CSS custom properties**, not JS theme objects: tokens live in
`packages/shared/styles/theme.scss` under `.light { --x }` / `.dark { --x }`;
read `var(--token)` in SCSS, never branch on `theme.isBase` in JSX. RTL: the
provider sets `data-dir` on `<html>` — use CSS logical properties
(`padding-inline-start`, …) and the mixins in
`libs/ui-kit/styles/mixins/_direction.scss`; never hand-write `[dir="rtl"]`
overrides. In SCSS, only `@docspace/ui-kit` and `@docspace/shared` prefixes
resolve in `@use` (custom Sass importer).

## Where components come from

UI primitives (Button, Text, toast, …) are in `@docspace/ui-kit/components`
(~99 components — the default place to look); `@docspace/shared/components`
holds only ~42 composite/domain components (media-viewer, share, …).
`toastr`, `cookie`, `socket` live in `@docspace/ui-kit/utils/*`.

## Path aliases

`PUBLIC_DIR` (repo `/public`), `ASSETS_DIR` (`packages/client/public`),
`SRC_DIR` (`packages/client/src`), `COMMON_DIR`, `PACKAGE_FILE`,
`@docspace/shared`, `@docspace/ui-kit`. Defined in **two places that must
stay in sync**: `packages/client/config/resolve.ts` (Vite) and `paths` in
`packages/client/tsconfig.json`.

## Routing

react-router **v8, data-router API, no `react-router-dom`** — import from
`"react-router"`. Routes live in `packages/client/src/routes/`; lazy loading
uses the route `lazy()` property wrapped in `componentLoader` (handles stale
chunks), not `React.lazy`:

```js
async lazy() {
  const { Component } = await componentLoader(() => import("SRC_DIR/pages/Home"));
  return { Component };
}
```

Gating via `PrivateRoute` / `PublicRoute` / `ProtectedAppRoute` wrappers.

Theme types (`TTheme`, `TColorScheme`) are imported from
`@docspace/ui-kit/providers/theme/themes`.
