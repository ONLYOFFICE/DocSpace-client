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
import { useTranslation } from "react-i18next";

import type { QuickActionItem } from "@docspace/ui-kit/components/quick-actions";
import { getConstName } from "@docspace/shared/constants/consts";
import {
  BlankPdfIcon,
  CreateDocumentIcon,
  CreatePresentationIcon,
  CreateSpreadsheetIcon,
} from "@docspace/ui-kit/components/quick-actions/icons";

import { makeCreateUrl, NEW_FILE_NAMES } from "../utils";

// Builds the "create new file" quick actions for the Dashboard. Each action
// opens the editor for a blank file of the matching type in the user's
// "My documents" folder.
export const useCreateActions = (
  myFolderId: number | null,
): QuickActionItem[] => {
  const { t } = useTranslation(["Common"]);

  return React.useMemo<QuickActionItem[]>(
    () => [
      {
        id: "document",
        icon: <CreateDocumentIcon />,
        label: t("Common:Document"),
        onClick: () =>
          window.open(
            makeCreateUrl(NEW_FILE_NAMES.document, myFolderId),
            "_blank",
          ),
      },
      {
        id: "spreadsheet",
        icon: <CreateSpreadsheetIcon />,
        label: t("Common:Spreadsheet"),
        onClick: () =>
          window.open(
            makeCreateUrl(NEW_FILE_NAMES.spreadsheet, myFolderId),
            "_blank",
          ),
      },
      {
        id: "presentation",
        icon: <CreatePresentationIcon />,
        label: t("Common:Presentation"),
        onClick: () =>
          window.open(
            makeCreateUrl(NEW_FILE_NAMES.presentation, myFolderId),
            "_blank",
          ),
      },
      {
        id: "pdf",
        icon: <BlankPdfIcon />,
        label: getConstName("PDF"),
        onClick: () =>
          window.open(makeCreateUrl(NEW_FILE_NAMES.pdf, myFolderId), "_blank"),
      },
    ],
    [t, myFolderId],
  );
};

export default useCreateActions;
