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

import { useMemo, useCallback } from "react";
import { useNavigate, LinkProps } from "react-router";
import { isMobile } from "react-device-detect";

import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { toastr } from "@docspace/ui-kit/components/toast";
import {
  Events,
  FileExtensions,
  FilesSelectorFilterTypes,
  FilterType,
  RoomSearchArea,
  RoomsType,
} from "@docspace/shared/enums";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import FilesFilter from "@docspace/shared/api/files/filter";
import type { TTranslation } from "@docspace/shared/types";
import { CategoryType } from "@docspace/shared/constants";

import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { InfoPanelView } from "SRC_DIR/helpers/info-panel";

import {
  getDescription,
  getIcon,
  getOptions,
  getTitle,
} from "./EmptyViewContainer.helpers";

import type {
  CreateEvent,
  EmptyViewContainerProps,
  ExtensionType,
  UploadType,
} from "./EmptyViewContainer.types";

export const useEmptyView = (
  {
    type,
    access,
    isFolder,
    folderType,
    parentRoomType,
    isRootEmptyPage,
    isArchiveFolderRoot,
    rootFolderType,
    isPublicRoom,
    security,
    selectedFolder,
    isKnowledgeTab,
    isResultsTab,
    isPortalAdmin,
    aiReady,
    standalone,
  }: EmptyViewContainerProps,

  t: TTranslation,
) => {
  const { isBase } = useTheme();

  const isAIRoom =
    selectedFolder?.roomType === RoomsType.AIRoom ||
    isKnowledgeTab ||
    isResultsTab;

  const emptyViewOptions = useMemo(() => {
    const description = getDescription(
      type,
      t,
      access,
      isFolder,
      folderType,
      parentRoomType,
      isArchiveFolderRoot,
      isRootEmptyPage,
      rootFolderType,
      isPublicRoom,
      security,
      isKnowledgeTab,
      isResultsTab,
      isAIRoom,
      aiReady,
      standalone,
      isPortalAdmin,
    );
    const title = getTitle(
      type,
      t,
      access,
      isFolder,
      folderType,
      parentRoomType,
      isArchiveFolderRoot,
      isRootEmptyPage,
      rootFolderType,
      security,
      isKnowledgeTab,
      isResultsTab,
      isAIRoom,
      aiReady,
      standalone,
      isPortalAdmin,
    );
    const icon = getIcon(
      type,
      isBase,
      access,
      isFolder,
      folderType,
      parentRoomType,
      isRootEmptyPage,
      rootFolderType,
      security,
      isResultsTab,
    );

    return { description, title, icon };
  }, [
    type,
    t,
    isBase,
    access,
    isFolder,
    folderType,
    parentRoomType,
    isRootEmptyPage,
    isArchiveFolderRoot,
    rootFolderType,
    isPublicRoom,
    isAIRoom,
    isKnowledgeTab,
    isResultsTab,
  ]);

  return emptyViewOptions;
};

export const useOptions = (
  {
    type,
    access,
    folderId,
    isFolder,
    security,
    folderType,
    selectedFolder,
    parentRoomType,
    isRootEmptyPage,
    isVisibleInfoPanel,
    isArchiveFolderRoot,
    rootFolderType,
    myFolderId,
    myFolder,
    roomsFolder,
    userId,
    isWarningRoomsDialog,
    setViewInfoPanel,
    onClickInviteUsers,
    setVisibleInfoPanel,
    onCreateAndCopySharedLink,
    setQuotaWarningDialogVisible,
    setSelectFileFormRoomDialogVisible,
    setSelectFileAiKnowledgeDialogVisible,
    inviteUser: inviteRootUser,
    setTemplateAccessSettingsVisible,

    isVisitor,
    isFrame,
    logoText,
    isKnowledgeTab,
    isResultsTab,
    aiReady,
    standalone,
    isPortalAdmin,
    isGracePeriod,
  }: EmptyViewContainerProps,
  t: TTranslation,
) => {
  const navigate = useNavigate();

  const isAIRoom =
    selectedFolder?.roomType === RoomsType.AIRoom ||
    isKnowledgeTab ||
    isResultsTab;

  const onGoToShared = useCallback(() => {
    const newFilter = RoomsFilter.getDefault(userId, RoomSearchArea.Active);

    newFilter.searchArea = RoomSearchArea.Active;

    const state = {
      title: roomsFolder?.title,
      isRoot: true,
      rootFolderType: roomsFolder?.rootFolderType,
    };

    const path = getCategoryUrl(CategoryType.Shared);
    return {
      to: {
        pathname: path,
        search: newFilter.toUrlParams(),
      },
      state,
    };
  }, [roomsFolder?.rootFolderType, roomsFolder?.title, userId]);

  const onGoToServices = useCallback(() => {
    return navigate("/portal-settings/payments/services");
  }, []);

  const onGoToAIProviderSettings = useCallback(() => {
    return navigate("/portal-settings/ai-settings/providers");
  }, []);

  const onGoToPersonal = useCallback((): LinkProps => {
    const newFilter = FilesFilter.getDefault();

    newFilter.folder = myFolderId?.toString() ?? "";

    const state = {
      title: myFolder?.title,
      isRoot: true,
      rootFolderType: myFolder?.rootFolderType,
    };

    const path = getCategoryUrl(CategoryType.Personal);

    return {
      to: {
        pathname: path,
        search: newFilter.toUrlParams(),
      },
      state,
    };
  }, [myFolder?.rootFolderType, myFolder?.title, myFolderId]);

  const onCreateRoom = useCallback(() => {
    if (isWarningRoomsDialog) {
      setQuotaWarningDialogVisible(true);
      return;
    }

    const event = new CustomEvent(Events.ROOM_CREATE, {
      detail: { parentId: selectedFolder?.id, context: "empty_state" },
    });
    window.dispatchEvent(event);
  }, [isWarningRoomsDialog, setQuotaWarningDialogVisible, selectedFolder?.id]);

  const onCreateAIAgent = useCallback(() => {
    if (isGracePeriod) {
      setQuotaWarningDialogVisible(true);
      return;
    }

    const event = new CustomEvent(Events.AGENT_CREATE, {
      detail: { parentId: selectedFolder?.id, context: "empty_state" },
    });
    window.dispatchEvent(event);
  }, [isGracePeriod, setQuotaWarningDialogVisible, selectedFolder?.id]);

  const openInfoPanel = useCallback(() => {
    if (!isVisibleInfoPanel) setVisibleInfoPanel?.(true);

    setViewInfoPanel?.(InfoPanelView.infoMembers);
  }, [setViewInfoPanel, setVisibleInfoPanel, isVisibleInfoPanel]);

  const onUploadAction = useCallback((uploadType: UploadType) => {
    const element =
      uploadType === "file"
        ? (document.querySelector(".custom-file-input-article") as HTMLElement)
        : uploadType === "pdf"
          ? document.getElementById("customPDFInput")
          : document.getElementById("customFolderInput");

    element?.click();
  }, []);

  const inviteUser = useCallback(() => {
    onClickInviteUsers?.(folderId, type);
  }, [onClickInviteUsers, folderId, type]);

  const uploadFromDocspace = useCallback(
    (
      filterParam: FilesSelectorFilterTypes | FilterType | string,
      openRoot: boolean = true,
    ) => {
      setSelectFileFormRoomDialogVisible?.(true, filterParam, openRoot);
    },
    [setSelectFileFormRoomDialogVisible],
  );

  const uploadFromDocspaceAiKnowledge = useCallback(() => {
    setSelectFileAiKnowledgeDialogVisible?.(true);
  }, [setSelectFileAiKnowledgeDialogVisible]);

  const onCreate = useCallback(
    (extension: ExtensionType, withoutDialog?: boolean) => {
      const event: CreateEvent = new Event(Events.CREATE);

      const edit = extension === FileExtensions.PDF;

      if (isMobile && edit && t) {
        toastr.info(t("Common:MobileEditPdfNotAvailableInfo"));
        return;
      }

      const payload = {
        id: -1,
        extension,
        withoutDialog,
        edit,
      };
      event.payload = payload;

      window.dispatchEvent(event);
    },
    [],
  );

  const createAndCopySharedLink = useCallback(() => {
    if (!selectedFolder) return;

    onCreateAndCopySharedLink?.(selectedFolder, t);
  }, [selectedFolder, onCreateAndCopySharedLink, t]);

  const onOpenAccessSettings = () => {
    setTemplateAccessSettingsVisible(true);
  };

  const options = useMemo(
    () =>
      getOptions(
        type,
        security!,
        t,
        access,
        isFolder,
        folderType,
        parentRoomType,
        isArchiveFolderRoot,
        isRootEmptyPage,
        rootFolderType,
        {
          inviteUser,
          onCreate,
          uploadFromDocspace,
          uploadFromDocspaceAiKnowledge,
          onUploadAction,
          createAndCopySharedLink,
          openInfoPanel,
          onCreateRoom,
          inviteRootUser,
          navigate,
          onGoToPersonal,
          onGoToShared,
          onOpenAccessSettings,
          onCreateAIAgent,
          onGoToServices,
          onGoToAIProviderSettings,
        },
        logoText,
        isVisitor,
        isFrame,
        isKnowledgeTab,
        isResultsTab,
        isAIRoom,
        aiReady,
        standalone,
        isPortalAdmin,
      ),
    [
      type,
      access,
      security,
      isFolder,
      folderType,
      parentRoomType,
      isArchiveFolderRoot,
      isRootEmptyPage,
      rootFolderType,
      t,
      inviteUser,
      onOpenAccessSettings,
      uploadFromDocspace,
      uploadFromDocspaceAiKnowledge,
      onUploadAction,
      createAndCopySharedLink,
      onCreate,
      openInfoPanel,
      onCreateRoom,
      inviteRootUser,
      navigate,
      onGoToPersonal,
      onGoToShared,
      isVisitor,
      isFrame,
      logoText,
      isKnowledgeTab,
      isResultsTab,
      isAIRoom,
    ],
  );

  return options;
};

