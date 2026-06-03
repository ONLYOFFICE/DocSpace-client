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

import type { EditorProps, IInitialConfig, TGoBack } from "@/types";
import { useTranslation } from "react-i18next";
import { FolderType } from "@docspace/ui-kit/enums";

const useGoBackAndClose = (
  fileInfo: EditorProps["fileInfo"],
  sdkConfig: EditorProps["sdkConfig"],
  user: EditorProps["user"],
  successAuth: boolean | undefined,
  openOnNewPage: boolean,
  i18n: ReturnType<typeof useTranslation>["i18n"],
  t: ReturnType<typeof useTranslation>["t"],
  config: IInitialConfig | undefined,
) => {
  const goBackUrl = config?.editorConfig?.customization?.goback?.url;

  const filling = fileInfo?.startFilling && config?.type === "embedded";

  let goBack: TGoBack = {} as TGoBack;

  if (fileInfo) {
    const editorGoBack = sdkConfig?.editorGoBack;

    const openFileLocationText = (
      (
        i18n.getDataByLanguage(i18n.language) as unknown as {
          Editor: { [key: string]: string };
        }
      )?.Editor as {
        [key: string]: string;
      }
    )?.FileLocation; // t("FileLocation");

    const withoutGoBackText = sdkConfig?.withoutGoBackText;

    if (editorGoBack === false || user?.isVisitor || !user) {
      console.log("goBack", goBack);
    } else if (editorGoBack === "event") {
      goBack = {
        requestClose: true,
        text: withoutGoBackText ? undefined : openFileLocationText,
        blank: openOnNewPage,
      };
    } else {
      goBack = {
        requestClose:
          typeof window !== "undefined"
            ? (window.ClientConfig?.editor?.requestClose ?? false)
            : false,
        text: openFileLocationText,
        blank: openOnNewPage,
      };
      if (
        typeof window !== "undefined" &&
        !window.ClientConfig?.editor?.requestClose
      ) {
        goBack.url = goBackUrl;
      }
    }
  }

  if (fileInfo?.rootFolderType === FolderType.DefaultTemplates) {
    goBack.url = `${window.location.origin}/portal-settings/customization/default-templates`;
  }

  let showClose =
    typeof document !== "undefined" &&
    document.referrer !== "" &&
    (window.history.length > 1 || filling);

  if (!successAuth) showClose = false;

  const close =
    showClose && !sdkConfig?.isSDK
      ? {
          visible: true,
          text: t("Common:CloseButton"),
        }
      : undefined;

  return { goBack, close };
};

export default useGoBackAndClose;
