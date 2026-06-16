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

import React from "react";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";

import type { QuickActionItem } from "@docspace/ui-kit/components/quick-actions";
import {
  BlankPdfIcon,
  CreateDocumentIcon,
  CreatePresentationIcon,
  CreateSpreadsheetIcon,
  CreateCustomRoomIllustrationIcon,
  UseRoomTemplateIllustrationIcon,
} from "@docspace/ui-kit/components/quick-actions/icons";
import { toastr } from "@docspace/ui-kit/components/toast";
import { Events } from "@docspace/shared/enums";
import { getConstName } from "@docspace/shared/constants/consts";

import {
  getQuickActionsSection,
  type SectionFlags,
} from "SRC_DIR/helpers/quickActions";

// Dispatches the same custom event the Article MainButton fires, so creation
// opens the regular client dialog and lands in the current folder. Mirrors
// MainButton.onCreate (the PDF flow carries `edit: true` and is blocked on
// mobile, where the editor cannot create a blank PDF form).
const dispatchCreate = (
  parentId: number | string | null,
  extension: string | null,
  t: (key: string) => string,
) => {
  const isPDF = extension === "pdf";

  if (isPDF && isMobile) {
    toastr.info(t("Common:MobileEditPdfNotAvailableInfo"));
    return;
  }

  const event = new CustomEvent(Events.CREATE, {
    detail: { parentId, context: "sidebar", extension },
  });
  // @ts-expect-error custom payload consumed by GlobalEvents/CreateEvent
  event.payload = { extension, id: -1, edit: isPDF };
  window.dispatchEvent(event);
};

const dispatchCreateRoom = (parentId: number | string | null) => {
  window.dispatchEvent(
    new CustomEvent(Events.ROOM_CREATE, {
      detail: { parentId, context: "sidebar" },
    }),
  );
};

export type UseQuickActionsProps = SectionFlags & {
  currentFolderId: number | string | null;
  // selectedFolderStore.security?.Create — folder-level create permission.
  canCreateFiles?: boolean;
  // SDK's canCreateRooms: admins / owners / room admins.
  canCreateRooms?: boolean;
};

export type QuickActionsResult = {
  show: boolean;
  items: QuickActionItem[];
};

// Builds the quick-actions tile set for the current Files/Rooms section,
// ported from the SDK (docs-layout + rooms-layout). Returns `show: false`
// when the current section has no banner.
export const useQuickActions = (
  props: UseQuickActionsProps,
): QuickActionsResult => {
  const { t } = useTranslation(["Common"]);

  const { currentFolderId, canCreateFiles, canCreateRooms, ...sectionFlags } =
    props;

  const section = getQuickActionsSection(sectionFlags);

  const fileItems = React.useMemo<QuickActionItem[]>(
    () => [
      {
        id: "quick-docx",
        icon: <CreateDocumentIcon />,
        label: t("Common:Document"),
        onClick: () => dispatchCreate(currentFolderId, "docx", t),
      },
      {
        id: "quick-xlsx",
        icon: <CreateSpreadsheetIcon />,
        label: t("Common:Spreadsheet"),
        onClick: () => dispatchCreate(currentFolderId, "xlsx", t),
      },
      {
        id: "quick-pptx",
        icon: <CreatePresentationIcon />,
        label: t("Common:Presentation"),
        onClick: () => dispatchCreate(currentFolderId, "pptx", t),
      },
      {
        id: "quick-pdf",
        icon: <BlankPdfIcon />,
        label: getConstName("PDF"),
        onClick: () => dispatchCreate(currentFolderId, "pdf", t),
      },
    ],
    [t, currentFolderId],
  );

  const roomItems = React.useMemo<QuickActionItem[]>(
    () => [
      {
        id: "quick-custom-room",
        icon: <CreateCustomRoomIllustrationIcon />,
        label: t("Common:NewRoom"),
        onClick: () => dispatchCreateRoom(currentFolderId),
      },
      // Matches the SDK: the use-template tile is shown but disabled (templates
      // are not wired up here yet).
      {
        id: "quick-use-template",
        icon: <UseRoomTemplateIllustrationIcon />,
        label: t("Common:UseTemplate"),
        disabled: true,
      },
    ],
    [t, currentFolderId],
  );

  if (section === "files" && canCreateFiles)
    return { show: true, items: fileItems };

  if (section === "rooms" && canCreateRooms)
    return { show: true, items: roomItems };

  // "private" rooms and every other section render no banner (see
  // getQuickActionsSection for why private rooms are skipped).
  return { show: false, items: [] };
};

export default useQuickActions;
