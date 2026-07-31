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

import { useCallback, type FC } from "react";
import { inject, observer } from "mobx-react";

import Share from "@docspace/shared/components/share";
import { ShareEventName } from "@docspace/shared/components/share/Share.constants";

import { FolderType } from "@docspace/shared/enums";

import type { ShareProps } from "@docspace/shared/components/share/Share.types";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import type { TGroup } from "@docspace/shared/api/groups/types";

interface ExternalShareProps {
  infoPanelSelection?: ShareProps["infoPanelSelection"];
  fileLinkProps?: ShareProps["fileLinkProps"];
  members?: ShareProps["members"];
}

interface WrapperShareProps extends Omit<
  ShareProps,
  "onAddUser" | "onClickGroup"
> {
  setEditMembersGroup: (group: TGroup) => void;
  setEditGroupMembersDialogVisible: (visible: boolean) => void;
}

const WrapperShare: FC<WrapperShareProps> = (props) => {
  const onAddUser = useCallback((item: TFolder | TFile) => {
    const event = new CustomEvent(ShareEventName, {
      detail: {
        open: true,
        item,
      },
    });

    window.dispatchEvent(event);
  }, []);

  const onClickGroup = useCallback((group: TGroup) => {
    if (group.isSystem) return;

    const { setEditMembersGroup, setEditGroupMembersDialogVisible } = props;

    setEditMembersGroup(group);
    setEditGroupMembersDialogVisible(true);
  }, []);

  return <Share {...props} onAddUser={onAddUser} onClickGroup={onClickGroup} />;
};

export default inject<TStore>(
  ({ infoPanelStore, userStore, dialogsStore, filesSettingsStore }) => {
    const selfId = userStore.user?.id ?? "";

    const {
      setLinkParams,
      setEditLinkPanelIsVisible,
      setEmbeddingPanelData,
      setIsShareFormData,

      setEditMembersGroup,
      setEditGroupMembersDialogVisible,
    } = dialogsStore;

    const {
      setView,

      shareChanged,
      setShareChanged,
      setIsScrollLocked,
    } = infoPanelStore;

    const {
      isExternalShareRestricted: isShareRestricted,
      externalShareApplyToDocuments,
      externalShareApplyToRooms,
      defaultShareLinkInternal,
      blockExistingLinksOnRestrict,
    } = filesSettingsStore;

    const selection = infoPanelStore.infoPanelSelection;
    const isInRoom =
      !Array.isArray(selection) &&
      selection !== null &&
      "rootFolderType" in selection &&
      selection.rootFolderType === FolderType.Rooms;

    return {
      setView,

      shareChanged,
      setShareChanged,
      selfId,
      setIsScrollLocked,
      setLinkParams,
      setEditLinkPanelIsVisible,
      setEmbeddingPanelData,
      onOpenPanel: setIsShareFormData,

      setEditMembersGroup,
      setEditGroupMembersDialogVisible,

      isExternalShareRestricted:
        isShareRestricted &&
        (isInRoom ? externalShareApplyToRooms : externalShareApplyToDocuments),
      blockExistingLinksOnRestrict,
      defaultShareLinkInternal,
    };
  },
)(observer(WrapperShare as FC<ExternalShareProps>));
