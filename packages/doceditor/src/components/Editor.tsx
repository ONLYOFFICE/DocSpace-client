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

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import {
  DocumentEditor,
  type IConfig,
} from "@onlyoffice/document-editor-react";

import { ThemeKeys } from "@docspace/shared/enums";
import { getEditorTheme } from "@docspace/shared/utils";
import { EDITOR_ID } from "@docspace/shared/constants";
import { useTheme } from "@docspace/shared/hooks/useTheme";

import UserAvatarBaseSvgUrl from "PUBLIC_DIR/images/avatar.editor.base.svg?url";
import UserAvatarDarkSvgUrl from "PUBLIC_DIR/images/avatar.editor.dark.svg?url";

import { IS_DESKTOP_EDITOR, IS_ZOOM, SHOW_CLOSE } from "@/utils/constants";
import { EditorProps, TGoBack } from "@/types";
import {
  onSDKRequestHistoryClose,
  onSDKRequestEditRights,
  onSDKInfo,
  onSDKWarning,
  onSDKError,
  onSDKRequestRename,
  // onOutdatedVersion,
} from "@/utils/events";
import useInit from "@/hooks/useInit";
import useEditorEvents from "@/hooks/useEditorEvents";
import { isPDFDocument } from "@/utils";

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
  onStartFillingVDRPanel,
  setFillingStatusDialogVisible,
  openShareFormDialog,
  onStartFilling,
}: EditorProps) => {
  const { t, i18n } = useTranslation(["Common", "Editor", "DeepLink"]);
  const { isBase } = useTheme();

  const openOnNewPage = IS_ZOOM ? false : !filesSettings?.openEditorInSameTab;

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
    onStartFillingVDRPanel,
    shareKey,
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

  console.log("test");

  const newConfig: IConfig = useMemo(() => {
    return config
      ? {
          document: config.document,
          documentType: config.documentType,
          token: config.token,
          type: config.type,
          editorConfig: { ...config.editorConfig },
        }
      : {};
  }, [config]);

  // if (config) newConfig.editorConfig = { ...config.editorConfig };

  // if (view && newConfig.editorConfig) newConfig.editorConfig.mode = "view";

  let goBack: TGoBack = {} as TGoBack;

  if (fileInfo) {
    const editorGoBack = sdkConfig?.editorGoBack;

    const openFileLocationText = (
      (
        i18n.getDataByLanguage(i18n.language) as unknown as {
          Editor: { [key: string]: string };
        }
      )?.Editor as {
        [key: string]: string;
      }
    )?.FileLocation; // t("FileLocation");

    if (editorGoBack === false || user?.isVisitor || !user) {
      console.log("goBack", goBack);
    } else if (editorGoBack === "event") {
      goBack = {
        requestClose: true,
        text: openFileLocationText,
        blank: openOnNewPage,
      };
    } else {
      goBack = {
        requestClose:
          typeof window !== "undefined"
            ? (window.ClientConfig?.editor?.requestClose ?? false)
            : false,
        text: openFileLocationText,
        blank: openOnNewPage,
      };
      if (
        typeof window !== "undefined" &&
        !window.ClientConfig?.editor?.requestClose
      ) {
        goBack.url = newConfig.editorConfig?.customization?.goback?.url;
      }
    }
  }

  const sdkCustomization: NonNullable<
    IConfig["editorConfig"]
  >["customization"] = sdkConfig?.editorCustomization;

  const theme = sdkCustomization?.uiTheme || user?.theme;

  if (newConfig.editorConfig) {
    newConfig.editorConfig.customization = {
      ...newConfig.editorConfig.customization,
      ...sdkCustomization,
      goback: { ...goBack },
      uiTheme: getEditorTheme(theme as ThemeKeys),
    };

    if (SHOW_CLOSE && !sdkConfig?.isSDK) {
      newConfig.editorConfig.customization.close = {
        visible: SHOW_CLOSE,
        text: t("Common:CloseButton"),
      };
    }
  }

  try {
    // if (newConfig.document && newConfig.document.info)
    //  newConfig.document.info.favorite = false;
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

  newConfig.events = {
    onDocumentReady,
    onRequestHistoryClose: onSDKRequestHistoryClose,
    onRequestEditRights: () =>
      onSDKRequestEditRights(t, fileInfo, newConfig.documentType),
    onAppReady: onSDKAppReady,
    onInfo: onSDKInfo,
    onWarning: onSDKWarning,
    onError: onSDKError,
    onRequestHistoryData: onSDKRequestHistoryData,
    onDocumentStateChange,
    onMetaChange,
    onMakeActionLink,
    // onOutdatedVersion,
    onDownloadAs,
    onUserActionRequired,
    onSubmit,
    onRequestRefreshFile,
  };

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
      newConfig.events.onRequestSaveAs = onSDKRequestSaveAs;
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

  if (isSharingAccess && !config?.startFilling) {
    newConfig.events.onRequestSharingSettings = onSDKRequestSharingSettings;
  }

  if (!fileInfo?.providerKey && user) {
    newConfig.events.onRequestReferenceData = onSDKRequestReferenceData;

    if (!IS_ZOOM) {
      newConfig.events.onRequestOpen = onSDKRequestOpen;
    }
  }

  if (fileInfo?.security.Rename) {
    newConfig.events.onRequestRename = (obj: object) =>
      onSDKRequestRename(obj, fileInfo.id);
  }

  if (fileInfo?.security.ReadHistory) {
    newConfig.events.onRequestHistory = onSDKRequestHistory;
  }

  if (fileInfo?.security.EditHistory) {
    newConfig.events.onRequestRestore = onSDKRequestRestore;
  }

  if (
    (typeof window !== "undefined" &&
      window.ClientConfig?.editor?.requestClose) ||
    SHOW_CLOSE ||
    IS_ZOOM
  ) {
    newConfig.events.onRequestClose = onSDKRequestClose;
  }

  if (config?.startFilling && !IS_ZOOM) {
    newConfig.events.onRequestStartFilling = onRequestStartFilling;
    newConfig.events.onStartFilling = onStartFilling;
  }

  if (config?.fillingStatus) {
    newConfig.events.onRequestFillingStatus = onRequestFillingStatus;
  }

  return (
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
      height="100%"
      width="100%"
      events_onDocumentReady={onDocumentReady}
    />
  );
};

export default dynamic(() => Promise.resolve(Editor), { ssr: false });
