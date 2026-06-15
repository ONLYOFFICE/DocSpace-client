import React from "react";

// SDK Next.js `basePath` (see next.config.js). `window.location.pathname`
// carries it (`/sdk/rooms/123`), whereas Next's `usePathname()` does not.
// We strip it so the pathname this hook returns matches `usePathname()`
// semantics — the host expects basePath-free paths to mirror into its own
// address bar.
const BASE_PATH = "/sdk";

const LOCATION_CHANGE_EVENT = "sdk:locationchange";

// pushState/replaceState share this signature.
type HistoryStateFn = (
  data: unknown,
  unused: string,
  url?: string | URL | null,
) => void;

// History is patched once per document and never restored: the App Router
// (next/navigation) also patches it, and tearing our wrapper down on the last
// consumer's unmount risks dropping Next's patch. The wrapper only dispatches
// an event, so leaving it installed is harmless. `patched` guards against
// double-wrapping when several consumers mount.
let patched = false;

const patchHistory = () => {
  if (patched) return;
  patched = true;

  const wrap = (method: "pushState" | "replaceState") => {
    // Capture whatever is currently installed (possibly Next's own wrapper)
    // and delegate to it, so router behaviour is preserved.
    const original = window.history[method].bind(
      window.history,
    ) as HistoryStateFn;
    const wrapped: HistoryStateFn = (data, unused, url) => {
      original(data, unused, url);
      window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
    };
    window.history[method] = wrapped;
  };

  wrap("pushState");
  wrap("replaceState");
};

const readLocation = () => ({
  pathname: window.location.pathname.startsWith(BASE_PATH)
    ? window.location.pathname.slice(BASE_PATH.length) || "/"
    : window.location.pathname,
  search: window.location.search.replace(/^\?/, ""),
});

/**
 * Browser location (basePath-stripped pathname + search without the leading
 * `?`) that updates on router navigation AND on `history.pushState` /
 * `replaceState` / `popstate`.
 *
 * The SDK changes folder / sort / page / filter via `history.pushState`,
 * which does NOT update Next's `usePathname()` / `useSearchParams()`. The
 * frame bridges need every such change so the host address bar can mirror the
 * full filter — hence this hook instead of the Next navigation hooks.
 */
export const useBrowserLocation = (): { pathname: string; search: string } => {
  const [location, setLocation] = React.useState(() =>
    typeof window === "undefined"
      ? { pathname: "/", search: "" }
      : readLocation(),
  );

  React.useEffect(() => {
    patchHistory();
    const update = () => setLocation(readLocation());
    // Sync once on mount in case the location changed between the initial
    // render and the effect firing.
    update();
    window.addEventListener("popstate", update);
    window.addEventListener(LOCATION_CHANGE_EVENT, update);
    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener(LOCATION_CHANGE_EVENT, update);
    };
  }, []);

  return location;
};

export default useBrowserLocation;
