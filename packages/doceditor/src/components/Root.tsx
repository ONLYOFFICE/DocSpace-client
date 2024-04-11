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

import React from "react";
import { useTranslation } from "react-i18next";

import ErrorContainer from "@docspace/shared/components/error-container/ErrorContainer";
import FirebaseHelper from "@docspace/shared/utils/firebase";
import { TFirebaseSettings } from "@docspace/shared/api/settings/types";
import AppLoader from "@docspace/shared/components/app-loader";

import { TResponse } from "@/types";
import useError from "@/hooks/useError";

import useDeviceType from "@/hooks/useDeviceType";
import useWhiteLabel from "@/hooks/useWhiteLabel";
import useRootInit from "@/hooks/useRootInit";
import useDeepLink from "@/hooks/useDeepLink";
import useSelectFileDialog from "@/hooks/useSelectFileDialog";
import useSelectFolderDialog from "@/hooks/useSelectFolderDialog";
import useSocketHelper from "@/hooks/useSocketHelper";
import useShareDialog from "@/hooks/useShareDialog";
import useFilesSettings from "@/hooks/useFilesSettings";
import useUpdateSearchParamId from "@/hooks/useUpdateSearchParamId";

import DeepLink from "./deep-link";
import Editor from "./Editor";
import SelectFileDialog from "./SelectFileDialog";
import SelectFolderDialog from "./SelectFolderDialog";
import SharingDialog from "./ShareDialog";

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
}: TResponse) => {
  const documentserverUrl = config?.editorUrl ?? error?.editorUrl;
  const fileInfo = config?.file;

  const instanceId = config?.document?.referenceData.instanceId;
  const isSkipError =
    error?.status === "not-found" ||
    error?.status === "access-denied" ||
    error?.status === "not-supported";

  const { t } = useTranslation(["Editor", "Common"]);

  useRootInit({
    documentType: config?.documentType,
  });

  const { getErrorMessage } = useError({
    error,
    editorUrl: documentserverUrl,
    t,
  });

  const { currentDeviceType } = useDeviceType();
  const { isShowDeepLink, setIsShowDeepLink } = useDeepLink({
    settings,
    fileInfo,
    email: user?.email,
  });
  const { filesSettings } = useFilesSettings({});
  const { socketHelper } = useSocketHelper({
    socketUrl: user ? settings?.socketUrl ?? "" : "",
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
    isSharingDialogVisible,

    onCloseSharingDialog,
    onSDKRequestSharingSettings,
  } = useShareDialog();

  useUpdateSearchParamId(fileId, hash);

  React.useEffect(() => {
    if (
      error &&
      error.message !== "restore-backup" &&
      error.message !== "unauthorized" &&
      !isSkipError
    ) {
      throw new Error(error.message);
    }
  }, [error, isSkipError]);

  return !fileId ? (
    <AppLoader />
  ) : isShowDeepLink ? (
    <DeepLink
      fileInfo={fileInfo}
      userEmail={user?.email}
      currentDeviceType={currentDeviceType}
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
          errorMessage={error?.message}
          onSDKRequestSharingSettings={onSDKRequestSharingSettings}
          onSDKRequestSaveAs={onSDKRequestSaveAs}
          onSDKRequestInsertImage={onSDKRequestInsertImage}
          onSDKRequestReferenceSource={onSDKRequestReferenceSource}
          onSDKRequestSelectDocument={onSDKRequestSelectDocument}
          onSDKRequestSelectSpreadsheet={onSDKRequestSelectSpreadsheet}
        />
      )}

      {isVisibleSelectFolderDialog && !!socketHelper && fileInfo && (
        <SelectFolderDialog
          socketHelper={socketHelper}
          isVisible={isVisibleSelectFolderDialog}
          onSubmit={onSubmitSelectFolderDialog}
          onClose={onCloseSelectFolderDialog}
          titleSelectorFolder={titleSelectorFolderDialog}
          fileInfo={fileInfo}
          getIsDisabled={getIsDisabledSelectFolderDialog}
          filesSettings={filesSettings}
          fileSaveAsExtension={extensionSelectorFolderDialog}
        />
      )}
      {selectFileDialogVisible && !!socketHelper && fileInfo && (
        <SelectFileDialog
          socketHelper={socketHelper}
          filesSettings={filesSettings}
          isVisible={selectFileDialogVisible}
          onSubmit={onSubmitSelectFileDialog}
          onClose={onCloseSelectFileDialog}
          getIsDisabled={getIsDisabledSelectFileDialog}
          fileTypeDetection={selectFileDialogFileTypeDetection}
          fileInfo={fileInfo}
        />
      )}
      {isSharingDialogVisible && !!socketHelper && fileInfo && (
        <SharingDialog
          isVisible={isSharingDialogVisible}
          fileInfo={fileInfo}
          onCancel={onCloseSharingDialog}
        />
      )}
    </div>
  );
};

export default Root;

