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
import { isMobile } from "react-device-detect";
import { useTranslation } from "react-i18next";

import { DocumentEditor } from "@onlyoffice/document-editor-react";
import IConfig from "@onlyoffice/document-editor-react/dist/esm/types/model/config";

import { FolderType, ThemeKeys } from "@docspace/shared/enums";
import { getEditorTheme } from "@docspace/shared/utils";

import { getBackUrl } from "@/utils";
import { IS_DESKTOP_EDITOR, IS_ZOOM } from "@/utils/constants";
import { EditorProps, TGoBack } from "@/types";
import {
  onSDKRequestHistoryClose,
  onSDKRequestEditRights,
  onSDKInfo,
  onSDKWarning,
  onSDKError,
  onSDKRequestRename,
} from "@/utils/events";
import useInit from "@/hooks/useInit";
import useEditorEvents from "@/hooks/useEditorEvents";

const Editor = ({
  config,
  successAuth,
  user,

  doc,
  documentserverUrl,
  fileInfo,
  isSharingAccess,
  errorMessage,

  onSDKRequestSharingSettings,
  onSDKRequestSaveAs,
  onSDKRequestInsertImage,
  onSDKRequestSelectSpreadsheet,
  onSDKRequestSelectDocument,
  onSDKRequestReferenceSource,
}: EditorProps) => {
  const { t } = useTranslation(["Common", "Editor", "DeepLink"]);

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

    documentReady,

    setDocTitle,
  } = useEditorEvents({
    user,
    successAuth,
    fileInfo,
    config,
    doc,
    errorMessage,
    t,
  });

  useInit({
    config,
    successAuth,
    fileInfo,
    user,
    documentReady,
    setDocTitle,
    t,
  });

  const newConfig: IConfig = config
    ? {
        document: config.document,
        documentType: config.documentType,
        token: config.token,
        type: config.type,
      }
    : {};

  if (config) newConfig.editorConfig = { ...config.editorConfig };

  const search = typeof window !== "undefined" ? window.location.search : "";
  const editorType = new URLSearchParams(search).get("editorType");

  //if (view && newConfig.editorConfig) newConfig.editorConfig.mode = "view";

  if (editorType) newConfig.type = editorType;

  if (isMobile) newConfig.type = "mobile";

  let goBack: TGoBack = {} as TGoBack;

  if (fileInfo) {
    const editorGoBack = new URLSearchParams(search).get("editorGoBack");

    if (editorGoBack === "false" || user?.isVisitor || !user) {
    } else if (editorGoBack === "event") {
      goBack = {
        requestClose: true,
        text: t?.("FileLocation"),
      };
    } else {
      goBack = {
        requestClose:
          typeof window !== "undefined"
            ? window.DocSpaceConfig?.editor?.requestClose ?? false
            : false,
        text: t?.("FileLocation"),
      };
      if (
        typeof window !== "undefined" &&
        !window.DocSpaceConfig?.editor?.requestClose
      ) {
        goBack.blank =
          typeof window !== "undefined"
            ? window.DocSpaceConfig?.editor?.openOnNewPage ?? true
            : false;
        goBack.url = getBackUrl(fileInfo.rootFolderType, fileInfo.folderId);
      }
    }
  }

  const customization = new URLSearchParams(search).get("customization");
  const sdkCustomization: NonNullable<
    IConfig["editorConfig"]
  >["customization"] = JSON.parse(customization || "{}");

  const theme = sdkCustomization?.uiTheme || user?.theme;

  if (newConfig.editorConfig)
    newConfig.editorConfig.customization = {
      ...newConfig.editorConfig.customization,
      ...sdkCustomization,
      goback: { ...goBack },
      uiTheme: getEditorTheme(theme as ThemeKeys),
    };

  //if (newConfig.document && newConfig.document.info)
  //  newConfig.document.info.favorite = false;

  // const url = window.location.href;

  // if (url.indexOf("anchor") !== -1) {
  //   const splitUrl = url.split("anchor=");
  //   const decodeURI = decodeURIComponent(splitUrl[1]);
  //   const obj = JSON.parse(decodeURI);

  //   config.editorConfig.actionLink = {
  //     action: obj.action,
  //   };
  // }

  newConfig.events = {
    onDocumentReady,
    onRequestHistoryClose: onSDKRequestHistoryClose,
    onRequestEditRights: () => onSDKRequestEditRights(fileInfo),
    onAppReady: onSDKAppReady,
    onInfo: onSDKInfo,
    onWarning: onSDKWarning,
    onError: onSDKError,
    onRequestHistoryData: onSDKRequestHistoryData,
    onDocumentStateChange,
    onMetaChange,
    onMakeActionLink,
  };

  if (successAuth) {
    if (
      fileInfo?.rootFolderType !== FolderType.USER &&
      fileInfo?.rootFolderType !== FolderType.SHARE &&
      fileInfo?.rootFolderType !== FolderType.Recent
    ) {
      //TODO: remove condition for share in my
      newConfig.events.onRequestUsers = onSDKRequestUsers;
      newConfig.events.onRequestSendNotify = onSDKRequestSendNotify;
    }
    if (!user?.isVisitor) {
      newConfig.events.onRequestSaveAs = onSDKRequestSaveAs;
      if (
        IS_DESKTOP_EDITOR ||
        (typeof window !== "undefined" &&
          window.DocSpaceConfig?.editor?.openOnNewPage === false)
      ) {
        newConfig.events.onRequestCreateNew = onSDKRequestCreateNew;
      }
    }

    newConfig.events.onRequestInsertImage = onSDKRequestInsertImage;
    newConfig.events.onRequestSelectSpreadsheet = onSDKRequestSelectSpreadsheet;
    newConfig.events.onRequestSelectDocument = onSDKRequestSelectDocument;
    newConfig.events.onRequestReferenceSource = onSDKRequestReferenceSource;
  }

  if (isSharingAccess) {
    newConfig.events.onRequestSharingSettings = onSDKRequestSharingSettings;
  }

  if (!fileInfo?.providerKey) {
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
    typeof window !== "undefined" &&
    window.DocSpaceConfig?.editor?.requestClose
  ) {
    newConfig.events.onRequestClose = onSDKRequestClose;
  }

  return (
    <DocumentEditor
      id={"docspace_editor"}
      documentServerUrl={documentserverUrl}
      config={
        errorMessage
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

export default Editor;
