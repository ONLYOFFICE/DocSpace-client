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

"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";

import { DocumentEditor, type IConfig } from "@onlyoffice/apps-ui-kit/document-editor";

import { ThemeKeys } from "@docspace/shared/enums";
import { getEditorTheme } from "@docspace/shared/utils";
import { EDITOR_ID } from "@docspace/shared/constants";
import { useResolvedFileTitle } from "@docspace/shared/hooks/useResolvedFileTitle";
import { isOAuthFrame } from "@docspace/shared/utils/oauthToken";
import { useTheme } from "@onlyoffice/apps-ui-kit/context/ThemeContext";

import UserAvatarBaseSvgUrl from "PUBLIC_DIR/images/avatar.editor.base.svg?url";
import UserAvatarDarkSvgUrl from "PUBLIC_DIR/images/avatar.editor.dark.svg?url";

import { IS_DESKTOP_EDITOR, IS_ZOOM } from "@/utils/constants";
import { EditorProps, TGoBack } from "@/types";
import {
  onSDKRequestHistoryClose,
  onSDKRequestEditRights,
  onSDKWarning,
  onSDKError,
  onSDKRequestRename,
  type TErrorEvent,
  // onOutdatedVersion,
} from "@/utils/events";
import useInit from "@/hooks/useInit";
import useEditorEvents from "@/hooks/useEditorEvents";
import useAIAttachFile from "@/hooks/useAIAttachFile";
import useGoBackAndClose from "@/hooks/useGoBackAndClose";
import useFileEncryptionKeys from "@/hooks/useFileEncryptionKeys";
import { isPDFDocument } from "@/utils";

import Bar from "./Bar";

type TCustomization = NonNullable<IConfig["editorConfig"]>["customization"];

const Editor = ({
  config,
  successAuth,
  user,

  doc,
  documentServerUrl,
  fileInfo,
  isSharingAccess,
  errorMessage,
  isSkipError,

  sdkConfig,

  organizationName = "",
  filesSettings,

  shareKey,

  onDownloadAs,
  onSDKRequestSharingSettings,
  onSDKRequestSaveAs,
  onSDKRequestInsertImage,
  onSDKRequestSelectSpreadsheet,
  onSDKRequestSelectDocument,
  onSDKRequestReferenceSource,
  onAIRequestStorageFile,
  onOpenRoleMappingPanel,
  setFillingStatusDialogVisible,
  openShareFormDialog,
  disconnectUsers,
  onStartFilling,
}: EditorProps) => {
  const { t, i18n } = useTranslation(["Common", "Editor", "DeepLink"]);
  const { isBase } = useTheme();

  const openOnNewPage = IS_ZOOM ? false : !filesSettings?.openEditorInSameTab;
  const isEncryptedFile = !!config?.file?.encrypted;
  // The description of an error the editor frame reported for an encrypted
  // file; shown in place of the editor.
  const [frameError, setFrameError] = React.useState<string | null>(null);

  const {
    onDocumentReady,
    onSDKRequestOpen,
    onSDKRequestReferenceData,
    onSDKAppReady,
    onSDKRequestClose,
    onSDKRequestCreateNew,
    onSDKRequestHistory,
    onSDKRequestUsers,
    onSDKRequestSendNotify,
    onSDKRequestRestore,
    onSDKRequestHistoryData,
    onDocumentStateChange,
    onMetaChange,
    onMakeActionLink,
    // onRequestStartFilling,
    documentReady,

    onUserActionRequired,

    setDocTitle,
    onSubmit,
    onRequestFillingStatus,
    onRequestStartFilling,

    onRequestRefreshFile,
    onInfo,
  } = useEditorEvents({
    user,
    successAuth,
    fileInfo,
    config,
    doc,
    errorMessage,
    isSkipError,
    openOnNewPage,
    t,
    sdkConfig,
    organizationName,
    setFillingStatusDialogVisible,
    openShareFormDialog,
    onOpenRoleMappingPanel,
    shareKey,
      disconnectUsers,
  });

  // AI is not available to guests and anonymous viewers — the same rule the
  // editor's AI plugin init follows in useEditorEvents — nor on an encrypted
  // file, whose content must not leave the browser.
  useAIAttachFile({
    documentServerUrl,
    enabled:
      Boolean(user) && !user?.isVisitor && !isOAuthFrame() && !isEncryptedFile,
    requestStorageFile: onAIRequestStorageFile,
  });

  useInit({
    config,
    successAuth,
    fileInfo,
    user,
    documentReady,
    setDocTitle,
    t,
    organizationName,
  });

  const { goBack, close } = useGoBackAndClose(
    fileInfo,
    sdkConfig,
    user,
    successAuth,
    openOnNewPage,
    i18n,
    t,
    config,
  );

  const encryption = useFileEncryptionKeys(config, user);

  // For encrypted files config.document.title is an opaque server placeholder;
  // the real name is decrypted into the filename cache by useFileEncryptionKeys
  // before the editor mounts.
  const resolvedTitle = useResolvedFileTitle(
    config
      ? {
          id: config.file?.id,
          title: config.document?.title,
          encrypted: config.file?.encrypted,
        }
      : null,
  );

  // The server sends `fileType`, `type` and the like as plain strings; their
  // values are the editor's own, so the config is handed over as `IConfig`.
  const newConfig: IConfig = useMemo(() => {
    return config
      ? ({
          document: { ...config.document, title: resolvedTitle },
          documentType: config.documentType,
          token: config.token,
          type: config.type,
          editorConfig: { ...config.editorConfig },
        } as IConfig)
      : {};
  }, [config, resolvedTitle]);

  // if (config) newConfig.editorConfig = { ...config.editorConfig };

  // if (view && newConfig.editorConfig) newConfig.editorConfig.mode = "view";

  const sdkCustomization = sdkConfig?.editorCustomization as TCustomization;

  try {
    if (
      newConfig.document &&
      newConfig.document.info &&
      !fileInfo?.requestToken
    )
      newConfig.document.info.favorite = !!fileInfo?.isFavorite;

    const url = typeof window !== "undefined" ? window.location.href : "";

    if (url.indexOf("anchor") !== -1) {
      const splitUrl = url.split("anchor=");
      const decodeURI = decodeURIComponent(splitUrl[1]);
      const obj = JSON.parse(decodeURI);

      if (newConfig.editorConfig)
        newConfig.editorConfig.actionLink = {
          action: obj.action,
        };
    }
  } catch (error) {
    console.error(error);
  }

  if (newConfig.editorConfig) {
    const theme = sdkCustomization?.uiTheme || user?.theme;

    newConfig.editorConfig.customization = {
      ...newConfig.editorConfig.customization,
      ...sdkCustomization,
      uiTheme: getEditorTheme(theme as ThemeKeys),
      goback: { ...goBack },
      close,
    };
  }

  if (
    encryption.status === "ready" &&
    encryption.encryptionKeys &&
    newConfig.editorConfig
  ) {
    newConfig.editorConfig.encryptionKeys = encryption.encryptionKeys;
  }

  newConfig.events = {
    onDocumentReady,
    onRequestEditRights: () =>
      onSDKRequestEditRights(t, fileInfo, newConfig.documentType),
    onAppReady: onSDKAppReady,
    onInfo,
    onWarning: onSDKWarning,
    onError: (event: object) => {
      onSDKError(event);
      if (isEncryptedFile) {
        setFrameError((event as TErrorEvent).data?.errorDescription ?? "");
      }
    },
    onDocumentStateChange,
    onMetaChange,
    onMakeActionLink,
    // onOutdatedVersion,
    onDownloadAs,
    onUserActionRequired,
    onSubmit,
  };

  // Design: private-rooms-editor-contract D16, refresh withheld for an encrypted file
  if (!isEncryptedFile) {
    newConfig.events.onRequestRefreshFile = onRequestRefreshFile;
  }

  if (
    (typeof window !== "undefined" &&
      window.ClientConfig?.editor?.requestClose) ||
    close?.visible ||
    IS_ZOOM
  ) {
    newConfig.events.onRequestClose = onSDKRequestClose;
  }

  if (
    typeof window !== "undefined" &&
    newConfig.editorConfig?.user &&
    newConfig.editorConfig.user.image?.includes(
      "default_user_photo_size_48-48.png",
    )
  ) {
    newConfig.editorConfig.user.image = isBase
      ? `${window.location.origin}${UserAvatarBaseSvgUrl}`
      : `${window.location.origin}${UserAvatarDarkSvgUrl}`;
  }

  if (successAuth) {
    newConfig.events.onRequestUsers = onSDKRequestUsers;
    newConfig.events.onRequestSendNotify = onSDKRequestSendNotify;

    if (!user?.isVisitor) {
      // Spec: editor-integration, "Decrypted copies only on the user's device"
      if (!isEncryptedFile) {
        newConfig.events.onRequestSaveAs = onSDKRequestSaveAs;
      }
      if (
        !isPDFDocument(fileInfo) &&
        (IS_DESKTOP_EDITOR || (typeof window !== "undefined" && !openOnNewPage))
      ) {
        newConfig.events.onRequestCreateNew = onSDKRequestCreateNew;
      }
    }

    newConfig.events.onRequestInsertImage = onSDKRequestInsertImage;
    newConfig.events.onRequestSelectSpreadsheet = onSDKRequestSelectSpreadsheet;
    newConfig.events.onRequestSelectDocument = onSDKRequestSelectDocument;
    newConfig.events.onRequestReferenceSource = onSDKRequestReferenceSource;
  }

  // Sharing is withheld for an encrypted file, as in the client file list.
  if (isSharingAccess && !config?.startFilling && !isEncryptedFile) {
    newConfig.events.onRequestSharingSettings = onSDKRequestSharingSettings;
  }

  if (!fileInfo?.providerKey && user) {
    newConfig.events.onRequestReferenceData = onSDKRequestReferenceData;

    if (!IS_ZOOM) {
      newConfig.events.onRequestOpen = onSDKRequestOpen;
    }
  }

  // The real name of an encrypted file lives in its container; the server
  // title is opaque, and the client and SDK withhold rename as well.
  if (fileInfo?.security.Rename && !isEncryptedFile) {
    newConfig.events.onRequestRename = (obj: object) =>
      onSDKRequestRename(obj, fileInfo.id);
  }

  // Spec: editor-integration, "Version history withheld in the editor for encrypted files"
  if (!isEncryptedFile) {
    newConfig.events.onRequestHistoryClose = onSDKRequestHistoryClose;
    newConfig.events.onRequestHistoryData = onSDKRequestHistoryData;

    if (fileInfo?.security.ReadHistory) {
      newConfig.events.onRequestHistory = onSDKRequestHistory;
    }

    if (fileInfo?.security.EditHistory) {
      newConfig.events.onRequestRestore = onSDKRequestRestore;
    }
  }

  // Spec: editor-integration, "Share to fill out hidden in a private room"
  if (config?.startFilling && !IS_ZOOM && !isEncryptedFile) {
    newConfig.events.onRequestStartFilling = onRequestStartFilling;
    newConfig.events.onStartFilling = onStartFilling;
  }

  if (config?.fillingStatus) {
    newConfig.events.onRequestFillingStatus = onRequestFillingStatus;
  }

  const isEncryptionGating =
    isEncryptedFile &&
    !errorMessage &&
    !isSkipError &&
    encryption.status !== "ready";

  const renderMessage = (message: React.ReactNode) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <div
        style={{
          height: "auto",
          overflow: "visible",
          position: "relative",
          zIndex: 1000,
        }}
      >
        <Bar quotaExceededScope={config?.quotaExceededScope} />
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "24px",
        }}
      >
        {message}
      </div>
    </div>
  );

  if (isEncryptionGating) {
    return renderMessage(
      encryption.status === "error"
        ? t("Common:SomethingWentWrong")
        : t("Common:LoadingProcessing"),
    );
  }

  // Spec: editor-integration, "Editor fails closed without the crypto library"
  if (frameError !== null) {
    return renderMessage(
      <>
        <div>{t("Common:SomethingWentWrong")}</div>
        {frameError ? <div>{frameError}</div> : null}
      </>,
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <div
        style={{
          height: "auto",
          overflow: "visible",
          position: "relative",
          zIndex: 1000,
        }}
      >
        <Bar quotaExceededScope={config?.quotaExceededScope} />
      </div>
      <DocumentEditor
        id={EDITOR_ID}
        documentServerUrl={documentServerUrl}
        config={
          errorMessage || isSkipError
            ? {
                events: {
                  onAppReady: onSDKAppReady,
                },
              }
            : newConfig
        }
      />
    </div>
  );
};

export default dynamic(() => Promise.resolve(Editor), { ssr: false });
