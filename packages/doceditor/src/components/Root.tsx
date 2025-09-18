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

"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";

import { TResponse } from "@/types";

import useError from "@/hooks/useError";
import useRootInit from "@/hooks/useRootInit";
import useDeepLink from "@/hooks/useDeepLink";
import useSelectFileDialog from "@/hooks/useSelectFileDialog";
import useSelectFolderDialog from "@/hooks/useSelectFolderDialog";
import useSocketHelper from "@/hooks/useSocketHelper";
import useShareDialog from "@/hooks/useShareDialog";
import useFilesSettings from "@/hooks/useFilesSettings";
import useUpdateSearchParamId from "@/hooks/useUpdateSearchParamId";
import { useStartFillingPanel } from "@/hooks/useStartFillingPanel";
import useSDK from "@/hooks/useSDK";

import { calculateAsideHeight } from "@/utils";
import { useFillingStatusDialog } from "@/hooks/userFillingStatusDialog";
import { useStopFillingDialog } from "@/hooks/useStopFillingDialog";
import { StopFillingDialog } from "@docspace/shared/dialogs/stop-filling";
import { useShareFormDialog } from "@/hooks/useShareFormDialog";
import useAssignRolesDialog from "@/hooks/useAssignRolesDialog";
import useChangeLinkTypeDialog from "@/hooks/useChangeLinkTypeDialog";
import { FolderType } from "@docspace/shared/enums";
import { getPersonalFolderTree } from "@docspace/shared/api/files";
import FillingStatusDialog from "./filling-status-dialog";
import Editor from "./Editor";

const ErrorContainer = dynamic(
  () => import("@docspace/shared/components/error-container/ErrorContainer"),
  {
    ssr: false,
  },
);

const DeepLink = dynamic(() => import("./deep-link"), {
  ssr: false,
});
const SelectFileDialog = dynamic(() => import("./SelectFileDialog"), {
  ssr: false,
});
const SelectFolderDialog = dynamic(() => import("./SelectFolderDialog"), {
  ssr: false,
});
const SharingDialog = dynamic(() => import("./ShareDialog"), {
  ssr: false,
});

const StartFillingPanel = dynamic(
  async () =>
    (await import("@docspace/shared/dialogs/start-filling")).StartFillingPanel,
  {
    ssr: false,
  },
);

const ShareFormDialog = dynamic(() => import("./ShareFormDialog"), {
  ssr: false,
});

const AssignRolesDialog = dynamic(
  async () =>
    (await import("@docspace/shared/dialogs/assign-roles-dialog"))
      .AssignRolesDialog,
  {
    ssr: false,
  },
);

const ChangeLinkTypeDialog = dynamic(() => import("./ChangeLinkTypeDialog"), {
  ssr: false,
});

const Root = ({
  settings,
  config,
  successAuth,
  user,
  error,
  isSharingAccess,

  doc,
  fileId,
  hash,
  shareKey,

  deepLinkSettings,
  baseSdkConfig,
}: TResponse) => {
  const editorRef = React.useRef<null | HTMLElement>(null);

  const documentServerUrl = config?.editorUrl ?? error?.editorUrl;
  const fileInfo = config?.file;
  const instanceId = config?.document?.referenceData.instanceId;
  const roomId = config?.document?.referenceData.roomId;
  const canEditRoom = config?.document?.referenceData.canEditRoom;

  const [selectedFolderId, setSelectedFolderId] = React.useState<
    string | number | undefined
  >(fileInfo?.folderId);

  const isSkipError =
    error?.status === "not-found" ||
    (error?.status === "access-denied" && !!error.editorUrl) ||
    error?.status === "not-supported" ||
    error?.status === "quota-exception";

  const { t } = useTranslation(["Editor", "Common"]);

  useRootInit({
    documentType: config?.documentType,
  });

  const { sdkConfig } = useSDK(baseSdkConfig);

  const { getErrorMessage } = useError({
    error,
    editorUrl: documentServerUrl,
  });

  const { isShowDeepLink, setIsShowDeepLink } = useDeepLink({
    settings,
    fileInfo,
    email: user?.email,
    deepLinkSettings,
  });

  const { filesSettings } = useFilesSettings();

  useSocketHelper({
    socketUrl: user ? (settings?.socketUrl ?? "") : "",
    user,
    shareKey,
    standalone: settings?.standalone,
  });

  const {
    changeLinkTypeDialogVisible,
    onCloseChangeLinkTypeDialog,
    onSubmitChangeLinkType,
    openChangeLinkTypeDialog,
  } = useChangeLinkTypeDialog();

  const {
    onSDKRequestSaveAs,
    onCloseSelectFolderDialog,
    onSubmitSelectFolderDialog,
    getIsDisabledSelectFolderDialog,

    isVisibleSelectFolderDialog,
    titleSelectorFolderDialog,
    extensionSelectorFolderDialog,
  } = useSelectFolderDialog();

  const {
    onSDKRequestInsertImage,
    onSDKRequestReferenceSource,
    onSDKRequestSelectDocument,
    onSDKRequestSelectSpreadsheet,
    onCloseSelectFileDialog,
    onSubmitSelectFileDialog,
    getIsDisabledSelectFileDialog,

    selectFileDialogFileTypeDetection,
    selectFileDialogVisible,
  } = useSelectFileDialog({ instanceId: instanceId ?? "" });

  const {
    assignRolesDialogData,
    onCloseAssignRolesDialog,
    openAssignRolesDialog,
    onSubmitAssignRoles,
  } = useAssignRolesDialog();

  const {
    onCloseShareFormDialog,
    openShareFormDialog,
    shareFormDialogVisible,
    onClickFormRoom,
    onClickVirtualDataRoom,

    getIsDisabledStartFillingSelectDialog,
    isVisibleStartFillingSelectDialog,
    onCloseStartFillingSelectDialog,
    onSubmitStartFillingSelectDialog,
    headerLabelSFSDialog,
    onDownloadAs,
    createDefineRoomType,
  } = useShareFormDialog(fileInfo, openAssignRolesDialog);

  const {
    isSharingDialogVisible,

    onCloseSharingDialog,
    onSDKRequestSharingSettings,
  } = useShareDialog(config, openShareFormDialog, fileInfo?.rootFolderType);

  const {
    roles,
    onStartFilling,
    inviteUserToRoom,
    startFillingPanelVisible,
    setStartFillingPanelVisible,
    onStartFillingVDRPanel,
    onSubmitStartFilling,
  } = useStartFillingPanel(fileInfo, roomId);

  useUpdateSearchParamId(fileId, hash);
  const {
    stopFillingDialogVisible,
    formId,
    onCloseStopFillingDialog,
    openStopFillingDialog,
    onSubmitStopFilling,
  } = useStopFillingDialog();

  const {
    fillingStatusDialogVisible,
    setFillingStatusDialogVisible,
    onCloseFillingStatusDialog,
    onStopFilling,
    onResetFilling,
  } = useFillingStatusDialog({
    openStopFillingDialog,
  });

  React.useEffect(() => {
    if (
      error &&
      error.message !== "restore-backup" &&
      error.message !== "unauthorized" &&
      error.message !== "unavailable" &&
      !isSkipError
    ) {
      throw new Error(error.message);
    }
  }, [error, isSkipError]);

  React.useEffect(() => {
    if (
      isSharingDialogVisible ||
      isVisibleSelectFolderDialog ||
      selectFileDialogVisible ||
      startFillingPanelVisible ||
      fillingStatusDialogVisible ||
      shareFormDialogVisible
    ) {
      setTimeout(() => calculateAsideHeight(calculateAsideHeight), 10);

      const activeElement = document.activeElement as HTMLElement | null;

      if (activeElement && activeElement.tagName === "IFRAME") {
        editorRef.current = activeElement;
        activeElement.blur();
      }
    } else if (editorRef.current) {
      editorRef.current.focus();
    }
  }, [
    isSharingDialogVisible,
    isVisibleSelectFolderDialog,
    selectFileDialogVisible,
    startFillingPanelVisible,
    fillingStatusDialogVisible,
    shareFormDialogVisible,
  ]);

  const organizationName = settings?.logoText || t("Common:OrganizationName");

  React.useEffect(() => {
    if (user?.isVisitor) return;

    const getMy = async () => {
      const res = await getPersonalFolderTree();

      const folderId = res[0].id;

      setSelectedFolderId(folderId);
    };
    if (fileInfo?.rootFolderType === FolderType.Recent) {
      getMy();
    }

    if (fileInfo?.rootFolderType === FolderType.RoomTemplates) {
      setSelectedFolderId(undefined);
    }
  }, [fileInfo?.rootFolderType, user?.isVisitor]);

  return isShowDeepLink ? (
    <DeepLink
      fileInfo={fileInfo}
      userEmail={user?.email}
      deepLinkConfig={settings?.deepLink}
      setIsShowDeepLink={setIsShowDeepLink}
      deepLinkSettings={deepLinkSettings ?? 0}
    />
  ) : error && error.message === "restore-backup" && !isSkipError ? (
    <ErrorContainer
      headerText={t("Common:Error")}
      customizedBodyText={getErrorMessage()}
      isEditor
    />
  ) : (
    <div style={{ width: "100%", height: "100%" }}>
      {documentServerUrl ? (
        <Editor
          config={config}
          user={user}
          successAuth={successAuth}
          doc={doc}
          isSharingAccess={isSharingAccess}
          documentServerUrl={documentServerUrl}
          fileInfo={fileInfo}
          sdkConfig={sdkConfig}
          errorMessage={error?.message}
          isSkipError={!!isSkipError}
          onDownloadAs={onDownloadAs}
          filesSettings={filesSettings}
          shareKey={shareKey}
          onSDKRequestSharingSettings={onSDKRequestSharingSettings}
          onSDKRequestSaveAs={onSDKRequestSaveAs}
          onSDKRequestInsertImage={onSDKRequestInsertImage}
          onSDKRequestReferenceSource={onSDKRequestReferenceSource}
          onSDKRequestSelectDocument={onSDKRequestSelectDocument}
          onSDKRequestSelectSpreadsheet={onSDKRequestSelectSpreadsheet}
          organizationName={organizationName}
          onStartFillingVDRPanel={onStartFillingVDRPanel}
          setFillingStatusDialogVisible={setFillingStatusDialogVisible}
          openShareFormDialog={openShareFormDialog}
          onStartFilling={onStartFilling}
        />
      ) : null}

      {isVisibleSelectFolderDialog && fileInfo ? (
        <SelectFolderDialog
          isVisible={isVisibleSelectFolderDialog}
          onSubmit={onSubmitSelectFolderDialog}
          onClose={onCloseSelectFolderDialog}
          titleSelectorFolder={titleSelectorFolderDialog}
          fileInfo={fileInfo}
          getIsDisabled={getIsDisabledSelectFolderDialog}
          filesSettings={filesSettings}
          fileSaveAsExtension={extensionSelectorFolderDialog}
          organizationName={organizationName}
          selectedFolderId={selectedFolderId}
        />
      ) : null}
      {selectFileDialogVisible && fileInfo ? (
        <SelectFileDialog
          filesSettings={filesSettings}
          isVisible={selectFileDialogVisible}
          onSubmit={onSubmitSelectFileDialog}
          onClose={onCloseSelectFileDialog}
          getIsDisabled={getIsDisabledSelectFileDialog}
          fileTypeDetection={selectFileDialogFileTypeDetection}
          fileInfo={fileInfo}
          shareKey={shareKey}
          selectedFolderId={selectedFolderId}
        />
      ) : null}
      {isSharingDialogVisible && fileInfo ? (
        <SharingDialog
          isVisible={isSharingDialogVisible}
          fileInfo={fileInfo}
          selfId={user?.id}
          onCancel={onCloseSharingDialog}
          filesSettings={filesSettings}
          onOpenPanel={openShareFormDialog}
        />
      ) : null}

      {user && settings && fileInfo && startFillingPanelVisible && roomId ? (
        <StartFillingPanel
          withBorder
          user={user}
          roles={roles}
          roomId={roomId}
          settings={settings}
          fileId={fileInfo.id}
          canEditRoom={canEditRoom}
          onSubmit={onSubmitStartFilling}
          inviteUserToRoom={inviteUserToRoom}
          setStartFillingPanelVisible={setStartFillingPanelVisible}
        />
      ) : null}
      {fillingStatusDialogVisible && fileInfo && user ? (
        <FillingStatusDialog
          file={fileInfo}
          user={user}
          visible={fillingStatusDialogVisible}
          onClose={onCloseFillingStatusDialog}
          onStopFilling={onStopFilling}
          onResetFilling={onResetFilling}
        />
      ) : null}
      {stopFillingDialogVisible ? (
        <StopFillingDialog
          formId={formId}
          visible={stopFillingDialogVisible}
          onClose={onCloseStopFillingDialog}
          onSubmit={onSubmitStopFilling}
        />
      ) : null}

      {shareFormDialogVisible && fileInfo ? (
        <ShareFormDialog
          file={fileInfo}
          filesSettings={filesSettings}
          createDefineRoomType={createDefineRoomType}
          headerLabelSFSDialog={headerLabelSFSDialog}
          onClose={onCloseShareFormDialog}
          onClickFormRoom={onClickFormRoom}
          onClickVirtualDataRoom={onClickVirtualDataRoom}
          getIsDisabledStartFillingSelectDialog={
            getIsDisabledStartFillingSelectDialog
          }
          onCloseStartFillingSelectDialog={onCloseStartFillingSelectDialog}
          onSubmitStartFillingSelectDialog={onSubmitStartFillingSelectDialog}
          isVisibleStartFillingSelectDialog={isVisibleStartFillingSelectDialog}
          openChangeLinkTypeDialog={openChangeLinkTypeDialog}
        />
      ) : null}

      {assignRolesDialogData.visible ? (
        <AssignRolesDialog
          visible={assignRolesDialogData.visible}
          onClose={onCloseAssignRolesDialog}
          onSubmit={onSubmitAssignRoles}
          roomName={assignRolesDialogData.roomName}
        />
      ) : null}

      {changeLinkTypeDialogVisible ? (
        <ChangeLinkTypeDialog
          visible={changeLinkTypeDialogVisible}
          onClose={onCloseChangeLinkTypeDialog}
          onSubmit={onSubmitChangeLinkType}
        />
      ) : null}
    </div>
  );
};

export default Root;
