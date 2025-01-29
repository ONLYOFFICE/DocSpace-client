// (c) Copyright Ascensio System SIA 2009-2024
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
import dynamic from "next/dynamic";

import React from "react";
import { useTranslation } from "react-i18next";

const ErrorContainer = dynamic(
  () => import("@docspace/shared/components/error-container/ErrorContainer"),
  {
    ssr: false,
  },
);

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
import useStartFillingSelectDialog from "@/hooks/useStartFillingSelectDialog";
import useSDK from "@/hooks/useSDK";

import Editor from "./Editor";

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
const StartFillingSelectorDialog = dynamic(
  () => import("./StartFillingSelectDialog"),
  {
    ssr: false,
  },
);
const ConflictResolveDialog = dynamic(() => import("./ConflictResolveDialog"), {
  ssr: false,
});

import { calculateAsideHeight } from "@/utils";
import { TFrameConfig } from "@docspace/shared/types/Frame";

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
}: TResponse) => {
  const editorRef = React.useRef<null | HTMLElement>(null);
  const [sdkConfig, setSdkConfig] = React.useState<TFrameConfig | null>(null);

  const documentserverUrl = config?.editorUrl ?? error?.editorUrl;
  const fileInfo = config?.file;

  const instanceId = config?.document?.referenceData.instanceId;

  const isSkipError =
    error?.status === "not-found" ||
    (error?.status === "access-denied" && !!error.editorUrl) ||
    error?.status === "not-supported" ||
    error?.status === "quota-exception";

  const { t } = useTranslation(["Editor", "Common"]);

  useRootInit({
    documentType: config?.documentType,
  });

  const { sdkFrameConfig } = useSDK();

  React.useEffect(() => setSdkConfig(sdkFrameConfig), [sdkFrameConfig]);

  const { getErrorMessage } = useError({
    error,
    editorUrl: documentserverUrl,
  });

  const { isShowDeepLink, setIsShowDeepLink } = useDeepLink({
    settings,
    fileInfo,
    email: user?.email,
  });
  const { filesSettings } = useFilesSettings({});
  useSocketHelper({
    socketUrl: user ? (settings?.socketUrl ?? "") : "",
    user,
    shareKey,
  });
  const {
    onSDKRequestSaveAs,
    onCloseSelectFolderDialog,
    onSubmitSelectFolderDialog,
    getIsDisabledSelectFolderDialog,

    isVisibleSelectFolderDialog,
    titleSelectorFolderDialog,
    extensionSelectorFolderDialog,
  } = useSelectFolderDialog({});
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
    getIsDisabledStartFillingSelectDialog,
    isVisibleStartFillingSelectDialog,
    onCloseStartFillingSelectDialog,
    onSubmitStartFillingSelectDialog,
    onSDKRequestStartFilling,
    conflictDataDialog,
    headerLabelSFSDialog,
    onDownloadAs,
  } = useStartFillingSelectDialog(fileInfo);

  const {
    isSharingDialogVisible,

    onCloseSharingDialog,
    onSDKRequestSharingSettings,
  } = useShareDialog(config, onSDKRequestStartFilling);

  useUpdateSearchParamId(fileId, hash);

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
      selectFileDialogVisible
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
  ]);

  const logoText = settings?.logoText || t("Common:OrganizationName");

  return isShowDeepLink ? (
    <DeepLink
      fileInfo={fileInfo}
      userEmail={user?.email}
      deepLinkConfig={settings?.deepLink}
      setIsShowDeepLink={setIsShowDeepLink}
    />
  ) : error && error.message === "restore-backup" && !isSkipError ? (
    <ErrorContainer
      headerText={t("Common:Error")}
      customizedBodyText={getErrorMessage()}
      isEditor
    />
  ) : (
    <div style={{ width: "100%", height: "100%" }}>
      {documentserverUrl && (
        <Editor
          config={config}
          user={user}
          successAuth={successAuth}
          doc={doc}
          isSharingAccess={isSharingAccess}
          documentserverUrl={documentserverUrl}
          fileInfo={fileInfo}
          sdkConfig={sdkConfig}
          errorMessage={error?.message}
          isSkipError={!!isSkipError}
          onDownloadAs={onDownloadAs}
          filesSettings={filesSettings}
          onSDKRequestSharingSettings={onSDKRequestSharingSettings}
          onSDKRequestSaveAs={onSDKRequestSaveAs}
          onSDKRequestInsertImage={onSDKRequestInsertImage}
          onSDKRequestReferenceSource={onSDKRequestReferenceSource}
          onSDKRequestSelectDocument={onSDKRequestSelectDocument}
          onSDKRequestSelectSpreadsheet={onSDKRequestSelectSpreadsheet}
          onSDKRequestStartFilling={onSDKRequestStartFilling}
          logoText={logoText}
        />
      )}

      {isVisibleSelectFolderDialog && fileInfo && (
        <SelectFolderDialog
          isVisible={isVisibleSelectFolderDialog}
          onSubmit={onSubmitSelectFolderDialog}
          onClose={onCloseSelectFolderDialog}
          titleSelectorFolder={titleSelectorFolderDialog}
          fileInfo={fileInfo}
          getIsDisabled={getIsDisabledSelectFolderDialog}
          filesSettings={filesSettings}
          fileSaveAsExtension={extensionSelectorFolderDialog}
          logoText={logoText}
        />
      )}
      {selectFileDialogVisible && fileInfo && (
        <SelectFileDialog
          filesSettings={filesSettings}
          isVisible={selectFileDialogVisible}
          onSubmit={onSubmitSelectFileDialog}
          onClose={onCloseSelectFileDialog}
          getIsDisabled={getIsDisabledSelectFileDialog}
          fileTypeDetection={selectFileDialogFileTypeDetection}
          fileInfo={fileInfo}
          shareKey={shareKey}
        />
      )}
      {isSharingDialogVisible && fileInfo && (
        <SharingDialog
          isVisible={isSharingDialogVisible}
          fileInfo={fileInfo}
          selfId={user?.id}
          onCancel={onCloseSharingDialog}
        />
      )}
      {isVisibleStartFillingSelectDialog && fileInfo && (
        <StartFillingSelectorDialog
          fileInfo={fileInfo}
          filesSettings={filesSettings}
          headerLabel={headerLabelSFSDialog}
          isVisible={
            isVisibleStartFillingSelectDialog && !conflictDataDialog.visible
          }
          onClose={onCloseStartFillingSelectDialog}
          onSubmit={onSubmitStartFillingSelectDialog}
          getIsDisabled={getIsDisabledStartFillingSelectDialog}
        />
      )}
      {conflictDataDialog.visible && (
        <ConflictResolveDialog {...conflictDataDialog} />
      )}
    </div>
  );
};

export default Root;
