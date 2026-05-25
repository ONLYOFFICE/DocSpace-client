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
import { useRouter } from "next/navigation";

import {
  frameCallEvent,
  frameCallbackData,
  frameHandlePing,
  getFrameId,
} from "@docspace/shared/utils/common";

import { useAiRoomStore } from "../_store";

/**
 * Reports lifecycle events to the parent iframe (onAppReady, onNavigate)
 * and handles incoming postMessage commands from the parent — ports the
 * three Shell.jsx callbacks (getAgentRoomId / openResultFile /
 * closeEditorPanel) into a postMessage protocol used by the SDK embedder.
 */
export const useAiAgentsFrameBridge = (
  isReady: boolean,
  currentTab: string | null,
) => {
  const router = useRouter();
  const aiRoomStore = useAiRoomStore();

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

  // Notify the parent on every (re)mount of an ai-agents page and on tab
  // changes, so its address bar can mirror the iframe's location. We read
  // `window.location` inside the effect instead of using `usePathname()` /
  // `useSearchParams()` — that keeps the hook signature identical to the
  // pre-bridge version (avoiding HMR-driven "order of Hooks changed"
  // warnings) and is sufficient here because list-detail-list navigation
  // remounts the consuming page component, re-firing this effect.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    frameCallEvent({
      event: "onNavigate",
      data: {
        section: currentTab,
        pathname: window.location.pathname,
        search: window.location.search,
      },
    });
  }, [currentTab]);

  React.useEffect(() => {
    const handler = (e: MessageEvent) => {
      // SDK iframes are embedded by arbitrary third-party origins (that is
      // the entire point of the SDK), so we intentionally do not validate
      // `event.origin` here — same posture as the (forms) layout bridge.
      // We only filter by `e.source === window.parent` to ignore messages
      // posted by other windows / unrelated postMessage senders.
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

      // Mirror Shell.jsx callbacks (lines 703–727).
      if (methodName === "getAgentRoomId") {
        frameCallbackData({ roomId: aiRoomStore.roomId }, callId);
        return;
      }

      if (methodName === "openResultFile") {
        const fileIdRaw = payload?.fileId;
        const fileId =
          typeof fileIdRaw === "number"
            ? fileIdRaw
            : typeof fileIdRaw === "string"
              ? Number(fileIdRaw)
              : NaN;
        const roomId = aiRoomStore.roomId;
        if (!roomId || !Number.isFinite(fileId)) {
          frameCallbackData({ error: "Invalid roomId or fileId" }, callId);
          return;
        }
        aiRoomStore.setCurrentTab("result");
        aiRoomStore.setSelectedResultFileId(fileId);
        router.replace(`/ai-agents/${roomId}?tab=result&fileId=${fileId}`);
        frameCallbackData({ roomId, fileId }, callId);
        return;
      }

      if (methodName === "closeEditorPanel") {
        aiRoomStore.setSelectedResultFileId(null);
        frameCallbackData({ ok: true }, callId);
        return;
      }

      // Unknown method — reply with an error so the parent frame's pending
      // promise resolves instead of hanging forever.
      if (methodName !== undefined) {
        frameCallbackData({ error: "unknown method", methodName }, callId);
      }
    };

    window.addEventListener("message", handler, false);
    return () => {
      window.removeEventListener("message", handler, false);
    };
  }, [router, aiRoomStore]);
};

export default useAiAgentsFrameBridge;
