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
import { useTranslation } from "react-i18next";

import { useOpenAiChat } from "@docspace/ui-kit/ai-agent/ai-chat-panel/hooks/useOpenAiChat";
import type { QuickActionItem } from "@docspace/ui-kit/components/quick-actions";
import { getConstName } from "@docspace/shared/constants/consts";
import {
  AIChatIcon,
  BlankPdfIcon,
  CreateDocumentIcon,
  CreatePresentationIcon,
  CreateSpreadsheetIcon,
} from "@docspace/ui-kit/components/quick-actions/icons";

import { GuestRestrictionTooltip } from "../sub-components/GuestRestrictionTooltip";
import { makeCreateUrl, NEW_FILE_NAMES } from "../utils";

// Builds the "create new file" quick actions for the Dashboard. Each action
// opens the editor for a blank file of the matching type in the user's
// "My documents" folder. Guests can't create files, so the tiles are disabled
// with a tooltip explaining why instead of being hidden.
export const useCreateActions = (
  myFolderId: number | null,
  isGuest: boolean,
  // Host-computed AI chat availability (Shell → AiAgentProviders context): false
  // when the portal has AI services switched off in settings, among the other
  // reasons the chat isn't offered. Passed in rather than read here so the tile
  // and the panel the dashboard hosts gate on one and the same value.
  isAiChatAvailable: boolean,
): QuickActionItem[] => {
  const { t } = useTranslation(["Common"]);

  const openChat = useOpenAiChat();

  const disabledProps = React.useMemo(
    () =>
      isGuest
        ? { disabled: true, tooltipContent: <GuestRestrictionTooltip /> }
        : undefined,
    [isGuest],
  );

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
        ...disabledProps,
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
        ...disabledProps,
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
        ...disabledProps,
      },
      {
        id: "pdf",
        icon: <BlankPdfIcon />,
        label: getConstName("PDF"),
        onClick: () =>
          window.open(makeCreateUrl(NEW_FILE_NAMES.pdf, myFolderId), "_blank"),
        ...disabledProps,
      },
      // Hidden rather than disabled when the chat isn't on offer: guests can
      // never hold a chat-capable role (AiAgentProviders sets `canUseAi` to
      // false for them) and the guest tooltip only covers create/upload
      // restrictions, while a portal with AI services off has no chat to open
      // at all.
      ...(isGuest || !isAiChatAvailable
        ? []
        : [
            {
              id: "quick-ai-chat",
              icon: <AIChatIcon />,
              label: t("Common:AIChat"),
              onClick: openChat,
            },
          ]),
    ],
    [t, myFolderId, disabledProps, isGuest, isAiChatAvailable, openChat],
  );
};

export default useCreateActions;
