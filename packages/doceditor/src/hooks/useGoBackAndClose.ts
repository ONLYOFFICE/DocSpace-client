// (c) Copyright Ascensio System SIA 2009-2025
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

import { EditorProps, TGoBack } from "@/types";
import { useTranslation } from "react-i18next";

const useGoBackAndClose = (
  fileInfo: EditorProps["fileInfo"],
  sdkConfig: EditorProps["sdkConfig"],
  user: EditorProps["user"],
  successAuth: boolean | undefined,
  openOnNewPage: boolean,
  i18n: ReturnType<typeof useTranslation>["i18n"],
  t: ReturnType<typeof useTranslation>["t"],
  goBackUrl: string | undefined,
) => {
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

    if (editorGoBack === false || user?.isVisitor || !user) {
      console.log("goBack", goBack);
    } else if (editorGoBack === "event") {
      goBack = {
        requestClose: true,
        text: openFileLocationText,
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

  let showClose =
    typeof document !== "undefined" &&
    document.referrer !== "" &&
    window.history.length > 1;

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
