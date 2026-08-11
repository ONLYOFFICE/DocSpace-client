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

export type TFileExportTexts = {
  /** Name of the saved file — it becomes the link inside the toast. */
  fileName: string;
  /** Section the file was saved to. */
  sectionName: string;
};

type TOpenUrlWithExportToastOptions = {
  url: string;
  openOnNewPage: boolean;
  /** Announce the file without trying to open it. */
  skipAutoOpen?: boolean;
  t: TTranslation;
  texts: TFileExportTexts;
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

/**
 * Opens a URL produced outside of a user gesture (after polling, a long await,
 * etc.) and always announces the file with a persistent toast linking to it.
 *
 * The toast is unconditional on purpose. A browser may block such window.open
 * calls as popups, and the link is what saves that case — clicking it is a
 * user gesture the popup blocker never interferes with. Showing it only on a
 * rejected open would make the outcome of the same action look different every
 * time, and the plain "saved to Documents" toast of the successful path named
 * neither the file nor a way back to it.
 */
export const openUrlWithExportToast = ({
  url,
  openOnNewPage,
  skipAutoOpen = false,
  t,
  texts,
}: TOpenUrlWithExportToastOptions) => {
  // announced up front: a "_self" open starts unloading the page, so a toast
  // mounted after it would never make it onto the screen
  showFileExportToast({
    url,
    openOnNewPage,
    t,
    fileName: texts.fileName,
    sectionName: texts.sectionName,
    persistent: true,
  });

  if (skipAutoOpen) return;

  setTimeout(() => {
    try {
      window.open(url, openOnNewPage ? "_blank" : "_self");
    } catch {
      // a blocked open rejects with an exception instead of a null result;
      // either way the toast already leads to the file
    }
  }, OPEN_URL_DELAY_MS);
};
