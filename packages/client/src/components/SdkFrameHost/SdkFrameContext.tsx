// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";

import type { SdkIframeHandle } from "SRC_DIR/components/SdkIframe";

export type SdkNavigateExtra = {
  pathname?: string;
  search?: string;
  highlight?: string;
};

export type SdkFrameCallbacks = {
  onNavigate?: (section: string, extra?: SdkNavigateExtra) => void;
  onFilterSearch?: (search: string) => void;
  onAppReady?: () => void;
};

export type FrameEntry = {
  // Canonical app identity. Switching appId triggers a dim-transition;
  // re-showing the same appId is a no-op (the page handles section nav).
  appId: string;
  // Frozen on first show of this appId — the iframe element never reloads.
  src: string;
  title: string;
  // Live refs so a page re-render (new closures) never remounts the iframe.
  callbacksRef: React.MutableRefObject<SdkFrameCallbacks>;
  apiRef: React.MutableRefObject<SdkIframeHandle | null>;
};

type HostState = {
  current: FrameEntry | null;
  incoming: FrameEntry | null;
};

type Action =
  | { type: "show"; entry: FrameEntry }
  | { type: "ready"; appId: string }
  | { type: "hide" };

const reducer = (state: HostState, action: Action): HostState => {
  switch (action.type) {
    case "show": {
      const { entry } = action;

      // Same app already current with no transition in flight — no-op on
      // frame topology. The page drives the section change via
      // navigateSection; the refs already carry fresh data.
      if (state.current?.appId === entry.appId && !state.incoming) {
        return state;
      }

      // A different app while one is current — start (or redirect) the
      // transition. The settled `current` always stays (dimmed); only the
      // `incoming` is replaceable, so a 3rd switch mid-flight just swaps the
      // loading frame and never flashes a half-loaded one.
      if (state.current && state.current.appId !== entry.appId) {
        if (state.incoming?.appId === entry.appId) return state;
        return { current: state.current, incoming: entry };
      }

      // First mount.
      return { current: entry, incoming: null };
    }

    case "ready": {
      if (state.incoming && state.incoming.appId === action.appId) {
        return { current: state.incoming, incoming: null };
      }
      return state;
    }

    case "hide":
      return { current: null, incoming: null };

    default:
      return state;
  }
};

type SdkFrameContextValue = {
  state: HostState;
  showFrame: (entry: FrameEntry) => void;
  markReady: (appId: string) => void;
  hideFrame: () => void;
};

const SdkFrameContext = React.createContext<SdkFrameContextValue | null>(null);

// If the incoming frame never reports `onAppReady` (error / dropped message),
// commit it anyway so the user can't get stuck on a dimmed outgoing frame.
// Kept above SdkIframe's own 5s internal-dim safety so the iframe's settle
// has priority.
const READY_FALLBACK_MS = 8000;

export const SdkFrameProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = React.useReducer(reducer, {
    current: null,
    incoming: null,
  });

  const showFrame = React.useCallback(
    (entry: FrameEntry) => dispatch({ type: "show", entry }),
    [],
  );
  const markReady = React.useCallback(
    (appId: string) => dispatch({ type: "ready", appId }),
    [],
  );
  const hideFrame = React.useCallback(() => dispatch({ type: "hide" }), []);

  const incomingId = state.incoming?.appId;
  React.useEffect(() => {
    if (!incomingId) return undefined;
    const timer = window.setTimeout(
      () => dispatch({ type: "ready", appId: incomingId }),
      READY_FALLBACK_MS,
    );
    return () => window.clearTimeout(timer);
  }, [incomingId]);

  const value = React.useMemo(
    () => ({ state, showFrame, markReady, hideFrame }),
    [state, showFrame, markReady, hideFrame],
  );

  return (
    <SdkFrameContext.Provider value={value}>
      {children}
    </SdkFrameContext.Provider>
  );
};

export const useSdkFrameContext = (): SdkFrameContextValue => {
  const ctx = React.useContext(SdkFrameContext);
  if (!ctx) {
    throw new Error("useSdkFrameContext must be used within SdkFrameProvider");
  }
  return ctx;
};
