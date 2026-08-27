/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  frameCallCommand,
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
 *
 * Lives at the layout level so that the message listener is always
 * installed regardless of which sub-route is mounted, and so that
 * parent-driven `navigateSection` doesn't have to re-mount any per-page
 * client component before being routable.
 */
export const useAiAgentsFrameBridge = (isReady: boolean) => {
  const router = useRouter();
  const aiRoomStore = useAiRoomStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = aiRoomStore.currentTab;

  const appReadySent = React.useRef(false);
  React.useEffect(() => {
    if (isReady && !appReadySent.current) {
      appReadySent.current = true;
      frameCallEvent({
        event: "onAppReady",
        data: { frameId: getFrameId() },
      });
      frameCallCommand("setIsLoaded");
    }
  }, [isReady]);

  // Notify the parent every time the iframe's logical location changes
  // (sub-route or agent tab) so its address bar can mirror the iframe.
  // Read pathname/search from `window.location` rather than Next's
  // `usePathname()` / `useSearchParams()` — agent-tab clicks bypass the
  // Next router and use raw `history.replaceState`, which doesn't update
  // Next's reactive URL state. We still keep those hooks in the deps so
  // the effect re-fires on real Next.js navigations; the MobX
  // `currentTab` covers the replaceState path.
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
  }, [pathname, searchParams, currentTab]);

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

      // Parent-driven navigation: the embedder posts the target section
      // (root/recent/favorites/trash/settings) or an agent detail
      // (agentId + optional tab) and we route the iframe internally via
      // Next.js' router instead of letting the embedder change the iframe
      // `src` — that would remount the SDK and lose the warmed runtime /
      // MobX stores / socket connection. Mirrors the (forms) bridge's
      // navigateSection handler.
      if (methodName === "navigateSection") {
        const section =
          typeof payload?.section === "string" ? payload.section : undefined;
        const agentIdRaw = payload?.agentId;
        const agentId =
          typeof agentIdRaw === "number"
            ? String(agentIdRaw)
            : typeof agentIdRaw === "string" && agentIdRaw !== ""
              ? agentIdRaw
              : undefined;
        const tab = typeof payload?.tab === "string" ? payload.tab : "chat";

        let path: string;
        if (agentId) {
          path = `/ai-agents/${agentId}?tab=${encodeURIComponent(tab)}`;
        } else if (
          section &&
          (section === "recent" ||
            section === "favorites" ||
            section === "trash" ||
            section === "settings")
        ) {
          path = `/ai-agents/${section}`;
        } else {
          path = "/ai-agents";
        }

        router.replace(path);
        frameCallbackData({ section, agentId, tab }, callId);
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
