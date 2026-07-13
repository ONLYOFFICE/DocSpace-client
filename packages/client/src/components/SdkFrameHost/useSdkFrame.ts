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

import React from "react";

import type { SdkIframeHandle } from "SRC_DIR/components/SdkIframe";

import {
  useSdkFrameContext,
  type SdkFrameCallbacks,
} from "./SdkFrameContext";

type UseSdkFrameArgs = {
  // Canonical app identity (e.g. "ai-files"). The frame is kept mounted as
  // long as it's the current/incoming app; switching appId dims the old
  // frame until the new one is ready.
  appId: string;
  // When false (page is gating: EmptyView / install dialog / settings still
  // loading) the host shows no frame and the page's own UI fills the area.
  enabled: boolean;
  // Called ONCE, only on the first show of this appId, to freeze the src.
  getSrc?: () => string;
  title?: string;
  onNavigate?: SdkFrameCallbacks["onNavigate"];
  onFilterSearch?: SdkFrameCallbacks["onFilterSearch"];
  onAppReady?: SdkFrameCallbacks["onAppReady"];
};

/**
 * Per-page handle to the persistent SDK frame host.
 *
 * The page keeps all its gating / inject / URL-mirror callbacks / the
 * `navigateSection` effect, but instead of rendering its own `<SdkIframe>` it
 * calls this hook to declare what the host should show, and returns `null`
 * (or its gating UI). The host owns the iframe lifecycle so it survives this
 * page's unmount on route change — that's what lets the previous content stay
 * visible (dimmed) while the next app loads.
 *
 * Must be called unconditionally (top-level) — toggle `enabled` to gate.
 */
export const useSdkFrame = ({
  appId,
  enabled,
  getSrc,
  title = "",
  onNavigate,
  onFilterSearch,
  onAppReady,
}: UseSdkFrameArgs): React.MutableRefObject<SdkIframeHandle | null> => {
  const { showFrame, hideFrame } = useSdkFrameContext();

  // Host-owned handle the page uses for its `navigateSection` effect.
  const apiRef = React.useRef<SdkIframeHandle | null>(null);

  // Live callbacks bag, refreshed every render and read by the host, so the
  // iframe never remounts when this page re-renders with new closures.
  const callbacksRef = React.useRef<SdkFrameCallbacks>({});
  callbacksRef.current = { onNavigate, onFilterSearch, onAppReady };

  // Freeze src per appId — recomputed only when appId changes.
  const srcRef = React.useRef<{ appId: string; src: string } | null>(null);
  if (enabled && getSrc && srcRef.current?.appId !== appId) {
    srcRef.current = { appId, src: getSrc() };
  }

  React.useEffect(() => {
    if (!enabled) {
      hideFrame();
      return;
    }
    if (!srcRef.current) return;
    showFrame({
      appId,
      src: srcRef.current.src,
      title,
      callbacksRef,
      apiRef,
    });
    // No cleanup that hides/unmounts on route change: the host owns the
    // outgoing frame and keeps it (dimmed) until the next page's showFrame
    // drives the transition. Hiding here would blank it -> white flash.
  }, [appId, enabled, title, showFrame, hideFrame]);

  return apiRef;
};

export default useSdkFrame;
