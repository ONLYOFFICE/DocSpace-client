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

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { frameCallEvent } from "@docspace/shared/utils/common";
import type { TFrameConfig } from "@docspace/shared/types/Frame";

type OpenDocEditorParams = {
  /** Open an existing file. Mutually exclusive with create params. */
  fileId?: number | string;
  /** Create a new file. Requires `fileTitle`. */
  parentId?: number | string;
  fileTitle?: string;
  /** Editor action, e.g. "view" for preview. */
  action?: string;
  /** Public-room share key (unused by the internal embedding today). */
  share?: string;
  /** Resolved from sdkConfig/filesSettings by the caller. */
  openInSameTab: boolean;
  /**
   * The SDK frame config, when available. When a host opted into the
   * `onEditorOpen` event, opening is delegated to the host instead of
   * navigating. `sdkConfig` is null in the internal client embedding, so
   * this branch is skipped there.
   */
  frameConfig?: TFrameConfig | null;
  /** Item payload forwarded to the host via the `onEditorOpen` event. */
  file?: object;
};

const getEditorOrigin = () =>
  window.ClientConfig?.proxy?.url ||
  window.ClientConfig?.api?.origin ||
  window.location.origin;

/**
 * Open (or create) a file in the real doceditor app (`/doceditor`).
 *
 * The SDK runs inside an iframe embedded by the DocSpace client. Routing the
 * editor through a SDK-local route used to wrap `/doceditor` in a second
 * iframe (editor "two frames deep"). Instead we navigate the **parent**
 * window straight to `/doceditor`, breaking out of the SDK frame, and let the
 * editor's native `returnUrl`-driven go-back/close return to the listing.
 *
 * Mirrors the client's own `FilesStore.openDocEditor`.
 */
export default function openDocEditor({
  fileId,
  parentId,
  fileTitle,
  action,
  share,
  openInSameTab,
  frameConfig,
  file,
}: OpenDocEditorParams) {
  if (typeof window === "undefined") return;

  const origin = getEditorOrigin();
  const isCreate = fileId === undefined;

  const buildUrl = (returnUrl?: string, isSDK?: boolean) => {
    const params = new URLSearchParams();

    if (isCreate) {
      params.set("parentId", String(parentId));
      params.set("fileTitle", String(fileTitle));
      params.set("withoutGoBackText", "true");
    } else {
      params.set("fileId", String(fileId));
    }

    if (action) params.set("action", action);
    if (share) params.set("share", share);
    if (returnUrl) params.set("returnUrl", returnUrl);
    if (isSDK) params.set("isSDK", "true");

    return combineUrl(
      origin,
      `/doceditor${isCreate ? "/create" : ""}?${params.toString()}`,
    );
  };

  // 1. Host opted into onEditorOpen: delegate to the host (open flow only).
  if (!isCreate && frameConfig?.events?.onEditorOpen) {
    frameCallEvent({ event: "onEditorOpen", data: { ...file, share, action } });
    return;
  }

  // 2. New tab: standalone editor with full chrome (no returnUrl, no isSDK).
  if (!openInSameTab) {
    window.open(buildUrl(), "_blank");
    return;
  }

  // 3. Same tab, embedded: break out of the SDK iframe and navigate the
  //    parent window. Same-origin, so reading/assigning parent.location does
  //    not throw; the catch guards against a hypothetical cross-origin host.
  if (window.parent && window.parent !== window) {
    try {
      const returnUrl = window.parent.location.href;
      window.parent.location.href = buildUrl(returnUrl, true);
      return;
    } catch {
      // Cross-origin host: fall through to navigating our own window.
    }
  }

  // 4. Same tab, not embedded.
  window.location.href = buildUrl(undefined, true);
}
