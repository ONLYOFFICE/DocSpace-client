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

import React from "react";

import { getCookie } from "@docspace/shared/utils";
import { isRetina } from "@docspace/shared/utils/common";
import { setCookie } from "@docspace/shared/utils/cookie";

import SlideIcoUrl from "PUBLIC_DIR/images/slide.ico?url";
import CellIcoUrl from "PUBLIC_DIR/images/cell.ico?url";
import WordIcoUrl from "PUBLIC_DIR/images/word.ico?url";
import PdfIcoUrl from "PUBLIC_DIR/images/pdf.ico?url";
import DiagramIcoUrl from "PUBLIC_DIR/images/diagram.ico?url";

import { calculateAsideHeight } from "@/utils";

interface UseRootInitProps {
  documentType?: string;
}

const useRootInit = ({ documentType }: UseRootInitProps) => {
  React.useEffect(() => {
    let icon: string = "";

    switch (documentType) {
      case "word":
        icon = WordIcoUrl;
        break;
      case "slide":
        icon = SlideIcoUrl;
        break;
      case "cell":
        icon = CellIcoUrl;
        break;
      case "pdf":
        icon = PdfIcoUrl;
        break;
      case "diagram":
        icon = DiagramIcoUrl;
        break;
      default:
        icon = WordIcoUrl;
        break;
    }

    if (icon) {
      const el = document.getElementById("favicon") as HTMLLinkElement;

      el.href = icon;
    }
  }, [documentType]);

  React.useEffect(() => {
    if (isRetina() && getCookie("is_retina") == null) {
      setCookie("is_retina", "true", { path: "/" });
    }
  }, []);

  React.useEffect(() => {
    // need for separate window in desktop editors
    if (window.AscDesktopEditor) {
      window.AscDesktopEditor.attachEvent?.(
        "onViewportSettingsChanged",
        calculateAsideHeight,
      );
    }
  }, []);
};

export default useRootInit;
