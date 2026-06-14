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

"use client";

import React from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

import {
  frameCallEvent,
  frameCallbackData,
  frameHandlePing,
  getFrameId,
} from "@docspace/shared/utils/common";

import { RoomsSection } from "@/types/rooms";

// Sections that live inside the (rooms) route group. The host can switch
// between these via `navigateSection` without reloading the iframe.
// Personal-files-backed sections (recent/favorites/trash) live in a
// different Next.js route group and are intentionally NOT handled here —
// the host reloads the iframe `src` for those.
const SECTION_TO_PATH: Record<string, string> = {
  [RoomsSection.Rooms]: "/rooms",
  [RoomsSection.Archive]: "/archive",
};

const VALID_SECTIONS: ReadonlySet<string> = new Set(
  Object.values(RoomsSection),
);

const sectionFromPathname = (pathname: string): string | null => {
  if (pathname === "/archive" || pathname.startsWith("/archive/")) {
    return RoomsSection.Archive;
  }
  if (pathname === "/rooms" || pathname.startsWith("/rooms/")) {
    return RoomsSection.Rooms;
  }
  return null;
};

/**
 * Wires the (rooms) app to the sdk-js host via postMessage.
 *
 * - Fires `onAppReady` once when the layout mounts.
 * - Fires `onNavigate` on section changes so the host can mirror its
 *   address bar (`?section=`).
 * - Listens for host-side `navigateSection` calls and routes internally
 *   via `router.replace` (no iframe reload).
 *
 * Lives at the (rooms) layout level so the listener is installed
 * regardless of which sub-route (rooms/archive) is mounted.
 */
export const useRoomsFrameBridge = (isReady: boolean) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeSection = sectionFromPathname(pathname);

  const appReadySent = React.useRef(false);
  React.useEffect(() => {
    if (isReady && !appReadySent.current) {
      appReadySent.current = true;
      frameCallEvent({
        event: "onAppReady",
        data: { frameId: getFrameId() },
      });
    }
  }, [isReady]);

  const prevSection = React.useRef<string | null>(activeSection);
  React.useEffect(() => {
    if (prevSection.current !== activeSection && activeSection) {
      prevSection.current = activeSection;
      frameCallEvent({
        event: "onNavigate",
        data: {
          section: activeSection,
          pathname,
          search: searchParams.toString(),
        },
      });
    }
  }, [activeSection, pathname, searchParams]);

  React.useEffect(() => {
    const handler = (e: MessageEvent) => {
      // SDK iframes are embedded by arbitrary third-party origins, so we
      // intentionally do not validate `event.origin` — same posture as the
      // ai-agents / forms / personal-files bridges. We only filter by
      // `e.source === window.parent`.
      if (window.self === window.parent || e.source !== window.parent) return;

      let eventData: Record<string, unknown> | undefined;
      try {
        eventData =
          typeof e.data === "string"
            ? JSON.parse(e.data)
            : (e.data as Record<string, unknown>);
      } catch {
        return;
      }

      if (!eventData) return;
      if (frameHandlePing(eventData)) return;

      const dataEnvelope = eventData?.data as
        | Record<string, unknown>
        | undefined;
      const methodName = dataEnvelope?.methodName as string | undefined;
      const callId = dataEnvelope?.callId as number | undefined;
      const payload = dataEnvelope?.data as Record<string, unknown> | undefined;

      if (methodName === "navigateSection") {
        const section = payload?.section as string | undefined;
        if (section && VALID_SECTIONS.has(section)) {
          router.replace(SECTION_TO_PATH[section]);
          frameCallbackData({ section }, callId);
        } else {
          frameCallbackData(
            { error: `Unknown section: ${String(section)}` },
            callId,
          );
        }
      }
    };

    window.addEventListener("message", handler, false);
    return () => {
      window.removeEventListener("message", handler, false);
    };
  }, [router]);
};

export default useRoomsFrameBridge;
