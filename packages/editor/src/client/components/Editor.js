import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { isMobile, isIOS, deviceType } from "react-device-detect";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { FolderType } from "@docspace/shared/enums";
import { EDITOR_ID } from "@docspace/shared/constants";

import { Toast } from "@docspace/shared/components/toast";
import { toast } from "react-toastify";
import {
  restoreDocumentsVersion,
  getEditDiff,
  getEditHistory,
  createFile,
  updateFile,
  checkFillFormDraft,
  convertFile,
  getReferenceData,
  getSharedUsers,
  getProtectUsers,
  sendEditorNotify,
} from "@docspace/shared/api/files";
import { EditorWrapper } from "../components/StyledEditor";
import { useTranslation } from "react-i18next";
import withDialogs from "../helpers/withDialogs";
import {
  assign,
  frameCallEvent,
  frameCallCommand,
} from "@docspace/shared/utils/common";
import { getEditorTheme } from "@docspace/shared/utils";
import { toastr } from "@docspace/shared/components/toast";
import { DocumentEditor } from "@onlyoffice/document-editor-react";
import DeepLink from "./DeepLink";
import { getDeepLink } from "../helpers/deepLinkHelper";

toast.configure();

let documentIsReady = false;
let docSaved = null;
let docTitle = null;
let docEditor;
let newConfig;
let documentserverUrl =
  typeof window !== "undefined" && window?.location?.origin;
let userAccessRights = {};
let isArchiveFolderRoot = true;
let usersInRoom = [];

const constructTitle = (firstPart, secondPart, reverse = false) => {
  return !reverse
    ? `${firstPart} - ${secondPart}`
    : `${secondPart} - ${firstPart}`;
};

const checkIfFirstSymbolInStringIsRtl = (str) => {
  if (!str) return;

  const rtlRegexp = new RegExp(
    /[\u04c7-\u0591\u05D0-\u05EA\u05F0-\u05F4\u0600-\u06FF]/,
  );

  return rtlRegexp.test(str[0]);
};

function Editor({
  config,
  //personal,
  successAuth,
  isSharingAccess,
  user,

  error,
  sharingDialog,
  onSDKRequestSharingSettings,

  isVisible,
  selectFileDialog,

  selectFolderDialog,

  isDesktopEditor,
  initDesktop,
  view,
  mfReady,
  fileId,
  url,

  logoUrls,
  currentColorScheme,
  portalSettings,
}) {
  const [isShowDeepLink, setIsShowDeepLink] = useState(false);

  const fileInfo = config?.file;

  const { t } = useTranslation(["Editor", "Common"]);

  const init = () => {
    try {
      let onRequestSharingSettings;

      if (isSharingAccess) {
        onRequestSharingSettings = onSDKRequestSharingSettings;
      }

      const events = {
        events: {
          onRequestSharingSettings,
        },
      };

      newConfig = Object.assign(config, events);
    } catch (error) {
      toastr.error(error.message, null, 0, true);
    }
  };

  const additionalComponents =
    error && !error?.unAuthorized ? (
      <ErrorContainerBody
        headerText={t("Common:Error")}
        customizedBodyText={errorMessage()}
      />
    ) : (
      <>
        {sharingDialog}
        {selectFileDialog}
        {selectFolderDialog}
      </>
    );

  return (
    <EditorWrapper isVisibleSharingDialog={isVisible}>
      {newConfig && (
        <DocumentEditor
          id={EDITOR_ID}
          documentServerUrl={documentserverUrl}
          config={newConfig}
          height="100%"
          width="100%"
          events_onDocumentReady={onDocumentReady}
        ></DocumentEditor>
      )}

      {additionalComponents}

      <Toast />
    </EditorWrapper>
  );
}

export default withDialogs(Editor);
