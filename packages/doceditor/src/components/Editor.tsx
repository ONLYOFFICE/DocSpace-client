"use client";

import React from "react";
import { isMobile } from "react-device-detect";

import { DocumentEditor } from "@onlyoffice/document-editor-react";
import IConfig from "@onlyoffice/document-editor-react/dist/esm/types/model/config";
import { EditorProps, TGoBack } from "@/types";

import useInit from "@/hooks/useInit";
import useEditorEvents from "@/hooks/useEditorEvents";

import { FolderType } from "@docspace/shared/enums";
import { getBackUrl } from "@/utils";
import { IS_DESKTOP_EDITOR, IZ_ZOOM } from "@/utils/constants";
import {
  onSDKRequestHistoryClose,
  onSDKRequestEditRights,
  onSDKInfo,
  onSDKWarning,
  onSDKError,
  onSDKRequestRename,
} from "@/utils/events";

import { getEditorTheme } from "@docspace/shared/utils";

const Editor = ({
  config,
  successAuth,
  user,
  view,
  doc,
  documentserverUrl,
  fileInfo,
  isSharingAccess,
  t,
  onSDKRequestSharingSettings,
  onSDKRequestSaveAs,
  onSDKRequestInsertImage,
  onSDKRequestSelectSpreadsheet,
  onSDKRequestSelectDocument,
  onSDKRequestReferenceSource,
}: EditorProps) => {
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

    createUrl,
    documentReady,
    usersInRoom,
    setDocTitle,
  } = useEditorEvents({
    user,
    successAuth,
    fileInfo,
    config,
    doc,
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

  const newConfig: IConfig = {
    document: config.document,
    documentType: config.documentType,
    token: config.token,
    type: config.type,
  };

  newConfig.editorConfig = { ...config.editorConfig };

  if (view && newConfig.editorConfig) newConfig.editorConfig.mode = "view";
  if (isMobile) config.type = "mobile";

  let goBack: TGoBack = {} as TGoBack;

  if (fileInfo) {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const editorGoBack = new URLSearchParams(search).get("editorGoBack");

    if (editorGoBack === "false") {
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
        goBack.url = getBackUrl(fileInfo.rootFolderId, fileInfo.folderId);
      }
    }
  }

  if (newConfig.editorConfig)
    newConfig.editorConfig.customization = {
      ...newConfig.editorConfig.customization,
      goback: { ...goBack },
      uiTheme: getEditorTheme(user?.theme),
    };

  if (newConfig.document && newConfig.document.info)
    newConfig.document.info.favorite = false;

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
    if (fileInfo?.rootFolderType !== FolderType.USER) {
      //TODO: remove condition for share in my
      newConfig.events.onRequestUsers = onSDKRequestUsers;
      newConfig.events.onRequestSendNotify = onSDKRequestSendNotify;
    }
    if (!user.isVisitor) {
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

  if (!fileInfo.providerKey) {
    newConfig.events.onRequestReferenceData = onSDKRequestReferenceData;

    if (!IZ_ZOOM) {
      newConfig.events.onRequestOpen = onSDKRequestOpen;
    }
  }

  if (fileInfo.security.Rename) {
    newConfig.events.onRequestRename = (obj: object) =>
      onSDKRequestRename(obj, fileInfo.id);
  }

  if (fileInfo.security.ReadHistory) {
    newConfig.events.onRequestHistory = onSDKRequestHistory;
  }

  if (fileInfo.security.EditHistory) {
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
      config={newConfig}
      height="100%"
      width="100%"
      events_onDocumentReady={onDocumentReady}
    />
  );
};

export default Editor;
