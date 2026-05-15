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

import {
  frameCallEvent,
  frameHandlePing,
  getFrameId,
} from "@docspace/shared/utils/common";

/**
 * Reports lifecycle events to the parent iframe (onAppReady, onNavigate).
 * Minimal bridge by analogy with (forms)/_hooks usage in FormsShell.
 */
export const useAiAgentsFrameBridge = (
  isReady: boolean,
  currentTab: string,
) => {
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

  const prevTab = React.useRef(currentTab);
  React.useEffect(() => {
    if (prevTab.current !== currentTab) {
      prevTab.current = currentTab;
      frameCallEvent({
        event: "onNavigate",
        data: { section: currentTab },
      });
    }
  }, [currentTab]);

  // Minimal handler — currently just consumes ping messages so the parent
  // can detect the frame is alive. Extend as new postMessage commands arise.
  React.useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (window.self === window.parent || e.source !== window.parent) return;
      let eventData: { type?: string; frameId?: string } | undefined;
      try {
        eventData = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (eventData) frameHandlePing(eventData);
    };
    window.addEventListener("message", handler, false);
    return () => {
      window.removeEventListener("message", handler, false);
    };
  }, []);
};

export default useAiAgentsFrameBridge;
