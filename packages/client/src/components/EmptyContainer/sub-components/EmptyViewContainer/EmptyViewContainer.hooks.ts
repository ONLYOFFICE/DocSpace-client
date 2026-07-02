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

import { useMemo, useCallback, useRef } from "react";
import { useNavigate, useLocation, LinkProps } from "react-router";
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
import getFilesFromEvent from "@docspace/shared/utils/get-files-from-event";
import type { TTranslation } from "@docspace/shared/types";
import { CategoryType } from "@docspace/shared/constants";

import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { InfoPanelView } from "SRC_DIR/helpers/info-panel";
import { useAIActivation } from "SRC_DIR/Hooks/useAIActivation";

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
    isCardLinkedToPortal,
    isPayer,
    walletCustomerEmail,
    walletCustomerDisplayName,
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
      isPayer,
      walletCustomerEmail,
      walletCustomerDisplayName,
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
      isKnowledgeTab,
      isAIRoom,
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
    aiReady,
    standalone,
    isPortalAdmin,
    isPayer,
    walletCustomerEmail,
    walletCustomerDisplayName,
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
    knowledgeId,
    startUpload,
    createFoldersTree,
    isCardLinkedToPortal,
    isPayer,
    enableAIService,
    getAIConfig,
    refreshCurrentFolder,
    refreshPaymentInfo,
  }: EmptyViewContainerProps,
  t: TTranslation,
) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const getTrashSection = () => {
    if (pathname.includes("/ai-agents/trash")) return "agents";
    if (pathname.includes("/forms/trash")) return "forms";
    if (pathname.includes("/rooms/trash")) return "rooms";
    return "personal";
  };

  const trashSectionRef = useRef<"personal" | "rooms" | "forms" | "agents">(
    "personal",
  );
  if (pathname.includes("/trash")) trashSectionRef.current = getTrashSection();
  const trashSection = trashSectionRef.current;

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

  const onGoToForms = useCallback((): LinkProps => {
    const newFilter = RoomsFilter.getDefault(userId, RoomSearchArea.Active);
    newFilter.searchArea = RoomSearchArea.Active;

    return {
      to: {
        pathname: "/forms/filter",
        search: newFilter.toUrlParams(userId, false),
      },
    };
  }, [userId]);

  const onGoToAgents = useCallback((): LinkProps => {
    const newFilter = RoomsFilter.getDefault(userId, RoomSearchArea.AIAgents);
    newFilter.searchArea = RoomSearchArea.AIAgents;

    return {
      to: {
        pathname: getCategoryUrl(CategoryType.AIAgents),
        search: newFilter.toUrlParams(userId, false),
      },
    };
  }, [userId]);

  const onGoToServices = useCallback(() => {
    return navigate("/portal-settings/payments/services");
  }, []);

  const onGoToAIProviderSettings = useCallback(() => {
    return navigate("/portal-settings/ai-settings/ai-models");
  }, []);

  const {
    onActivateAI,
    onTopUpAndActivateAI,
    onShowAIBenefits,
    onDialogActivate,
    onAIActivated,
    isActivating,
    aiFeaturesDialogVisible,
    onCloseAIFeaturesDialog,
    simpleTopUpDialogVisible,
    onCloseSimpleTopUpDialog,
  } = useAIActivation({
    enableAIService,
    getAIConfig,
    refreshCurrentFolder,
    refreshPaymentInfo,
    isCardLinkedToPortal,
    parentId: selectedFolder?.id,
    context: "empty_state",
  });

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
    }) as CustomEvent & { payload?: { startRoomType: RoomsType } };
    // In the "Forms" section only Form Filling Rooms can be created.
    if (window.location.pathname.startsWith("/forms")) {
      event.payload = { startRoomType: RoomsType.FormRoom };
    }
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

  // Device upload for the agent knowledge tab. The new-concept client has no
  // article main button (its hidden `.custom-file-input-article` that
  // `onUploadAction` relies on), so build a transient file input and upload
  // straight into the knowledge folder (`knowledgeId`) — same target the SDK
  // knowledge device upload uses.
  const uploadFromDeviceAiKnowledge = useCallback(() => {
    if (!knowledgeId) return;

    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.style.display = "none";

    input.onchange = async (e) => {
      try {
        const files = await getFilesFromEvent(e);
        const tree = await createFoldersTree(t, files);
        if (tree.length > 0) startUpload(tree, knowledgeId, t);
      } catch (err) {
        toastr.error(err as string, undefined, 0, true);
      } finally {
        input.remove();
      }
    };

    document.body.appendChild(input);
    input.click();
  }, [knowledgeId, createFoldersTree, startUpload, t]);

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
          uploadFromDeviceAiKnowledge,
          onUploadAction,
          createAndCopySharedLink,
          openInfoPanel,
          onCreateRoom,
          inviteRootUser,
          navigate,
          onGoToPersonal,
          onGoToShared,
          onGoToForms,
          onGoToAgents,
          onOpenAccessSettings,
          onCreateAIAgent,
          onGoToServices,
          onGoToAIProviderSettings,
          onTopUpAndActivateAI,
          onActivateAI,
          onShowAIBenefits,
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
        trashSection,
        isCardLinkedToPortal,
        isPayer,
        isActivating,
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
      uploadFromDeviceAiKnowledge,
      onUploadAction,
      createAndCopySharedLink,
      onCreate,
      openInfoPanel,
      onCreateRoom,
      inviteRootUser,
      navigate,
      onGoToPersonal,
      onGoToShared,
      onGoToForms,
      onGoToAgents,
      trashSection,
      isVisitor,
      isFrame,
      logoText,
      isKnowledgeTab,
      isResultsTab,
      isAIRoom,
      aiReady,
      standalone,
      isPortalAdmin,
      isCardLinkedToPortal,
      isPayer,
      isActivating,
    ],
  );

  return {
    options,
    aiFeaturesDialogVisible,
    onCloseAIFeaturesDialog,
    onDialogActivate,
    simpleTopUpDialogVisible,
    onCloseSimpleTopUpDialog,
    onAIActivated,
    isActivating,
  };
};
