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

import type { TTranslation } from "@docspace/shared/types";
import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";
import type { MainButtonProps } from "@docspace/ui-kit/components/main-button/MainButton.types";

type TGetCreateModel = (
  t: TTranslation,
  isSectionMenu?: boolean,
) => ContextMenuModel[] | null;

export type GetSectionCreateButtonParams = {
  t: TTranslation;

  isContactsPage: boolean;
  isContactsGroupsPage: boolean;
  isContactsGuestsPage: boolean;
  isRoomsFolder: boolean;
  isAIAgentsFolder: boolean;
  isFormsSection: boolean;

  selectedFolderId?: number | string;

  getFolderModel: TGetCreateModel;
  getContactsModel: TGetCreateModel;
  onCreateRoom: () => void;
  onCreateAgent: () => void;
  createGroup: (parentId?: number | string, context?: string) => void;
};

export type SectionCreateButtonResult = {
  showMainButton: boolean;
  mainButtonProps?: MainButtonProps;
};

const HIDDEN: SectionCreateButtonResult = { showMainButton: false };

export const getSectionCreateButton = ({
  t,
  isContactsPage,
  isContactsGroupsPage,
  isContactsGuestsPage,
  isRoomsFolder,
  isAIAgentsFolder,
  isFormsSection,
  selectedFolderId,
  getFolderModel,
  getContactsModel,
  onCreateRoom,
  onCreateAgent,
  createGroup,
}: GetSectionCreateButtonParams): SectionCreateButtonResult => {
  // The "Forms" section reuses the Rooms folder, so check it before the
  // generic rooms branch: it creates a Form Filling Room (onCreateRoom is
  // wired to preset the FFR type when in the Forms route).
  if (isFormsSection) {
    const model = getFolderModel(t);
    if (!model || model.length === 0) return HIDDEN;

    return {
      showMainButton: true,
      mainButtonProps: {
        text: t("Common:CreateFormSet"),
        isDropdown: false,
        model: [],
        onAction: () => onCreateRoom(),
      },
    };
  }

  if (isAIAgentsFolder) {
    const model = getFolderModel(t);
    if (!model || model.length === 0) return HIDDEN;

    return {
      showMainButton: true,
      mainButtonProps: {
        text: t("Common:NewAgent"),
        isDropdown: false,
        model: [],
        onAction: () => onCreateAgent(),
      },
    };
  }

  if (isRoomsFolder) {
    const model = getFolderModel(t);
    if (!model || model.length === 0) return HIDDEN;

    return {
      showMainButton: true,
      mainButtonProps: {
        text: t("Common:NewRoom"),
        isDropdown: false,
        model: [],
        onAction: () => onCreateRoom(),
      },
    };
  }

  if (isContactsPage) {
    if (isContactsGuestsPage) return HIDDEN;

    const model = getContactsModel(t);
    if (!model || model.length === 0) return HIDDEN;

    if (isContactsGroupsPage) {
      return {
        showMainButton: true,
        mainButtonProps: {
          text: t("Common:New"),
          isDropdown: false,
          model: [],
          onAction: () => createGroup(selectedFolderId, "sidebar"),
        },
      };
    }

    return {
      showMainButton: true,
      mainButtonProps: {
        text: t("Common:Invite"),
        isDropdown: true,
        model,
      },
    };
  }

  const model = getFolderModel(t);
  if (!model || model.length === 0) return HIDDEN;

  return {
    showMainButton: true,
    mainButtonProps: {
      text: t("Common:New"),
      isDropdown: true,
      model,
    },
  };
};
