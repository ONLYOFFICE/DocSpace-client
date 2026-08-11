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

"use client";

import { Trans } from "react-i18next";
import { TFunction } from "i18next";

import { Link, LinkTarget } from "@docspace/ui-kit/components/link";
import { toastr } from "@docspace/ui-kit/components/toast";

import { TTranslation } from "../types";

// hack for ios: the deferred window.open only works there when it is detached
// from the resolved promise chain
export const OPEN_URL_DELAY_MS = 100;

export type TOpenUrlFallbackTexts = {
  /** Plain toast shown when the auto-open worked; omit to show none. */
  success?: string;
  /** Name of the saved file — it becomes the link inside the fallback toast. */
  fileName: string;
  /** Section the file was saved to. */
  sectionName: string;
};

type TOpenUrlWithFallbackToastOptions = {
  url: string;
  openOnNewPage: boolean;
  /** Skip the window.open attempt and go straight to the fallback toast. */
  skipAutoOpen?: boolean;
  t: TTranslation;
  texts: TOpenUrlFallbackTexts;
};

type TShowFileExportToastOptions = {
  url: string;
  openOnNewPage: boolean;
  t: TTranslation;
  fileName: string;
  sectionName: string;
  /** Keep the toast until the user dismisses it and highlight the link. */
  persistent?: boolean;
};

/**
 * Toast naming an exported file and linking to it.
 */
export const showFileExportToast = ({
  url,
  openOnNewPage,
  t,
  fileName,
  sectionName,
  persistent = false,
}: TShowFileExportToastOptions) => {
  const message = (
    <Trans
      t={t as TFunction}
      i18nKey="FileExportDestination"
      ns="Common"
      values={{ fileName, sectionName }}
      components={{
        1: (
          <Link
            tag="a"
            href={url}
            target={openOnNewPage ? LinkTarget.blank : LinkTarget.self}
            rel="noreferrer"
            color="accent"
            isHovered={persistent}
            // toastr wraps custom content in a plain div, so react-toastify
            // never injects closeToast into it — clearing all toasts is the
            // only way to dismiss from here
            onClick={persistent ? () => toastr.clear() : undefined}
          />
        ),
      }}
    />
  );

  if (!persistent) {
    toastr.success(message);
    return;
  }

  toastr.success(message, undefined, 0, true);
};

const showFallbackToast = (
  url: string,
  openOnNewPage: boolean,
  t: TTranslation,
  texts: TOpenUrlFallbackTexts,
) => {
  showFileExportToast({
    url,
    openOnNewPage,
    t,
    fileName: texts.fileName,
    sectionName: texts.sectionName,
    persistent: true,
  });
};

/**
 * Opens a URL produced outside of a user gesture (after polling, a long await,
 * etc.). A browser may block such window.open calls as popups, so when the
 * attempt is rejected the user gets a persistent toast with a real link —
 * clicking it is a user gesture the popup blocker never interferes with.
 */
export const openUrlWithFallbackToast = ({
  url,
  openOnNewPage,
  skipAutoOpen = false,
  t,
  texts,
}: TOpenUrlWithFallbackToastOptions) => {
  if (skipAutoOpen) {
    showFallbackToast(url, openOnNewPage, t, texts);
    return;
  }

  // "_self" navigation is never popup-blocked, so its outcome is known in
  // advance — the toast has to be mounted before the page starts unloading
  if (!openOnNewPage && texts.success) toastr.success(texts.success);

  setTimeout(() => {
    try {
      const opened = window.open(url, openOnNewPage ? "_blank" : "_self");

      if (!openOnNewPage) return;

      if (opened) {
        if (texts.success) toastr.success(texts.success);
        return;
      }
    } catch {
      // a blocked open rejected with an exception instead of a null result
    }

    showFallbackToast(url, openOnNewPage, t, texts);
  }, OPEN_URL_DELAY_MS);
};
