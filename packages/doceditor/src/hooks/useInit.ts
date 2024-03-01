import React from "react";
import { isIOS, deviceType } from "react-device-detect";

import { FolderType } from "@docspace/shared/enums";

import { UseInitProps } from "@/types";
import { initForm, setDocumentTitle, showDocEditorMessage } from "@/utils";
import initDesktop from "@/utils/initDesktop";
import { IS_DESKTOP_EDITOR, IS_VIEW } from "@/utils/constants";

const useInit = ({
  config,
  successAuth,
  fileInfo,
  user,
  t,
  setDocTitle,
  documentReady,
}: UseInitProps) => {
  React.useEffect(() => {
    if (isIOS && deviceType === "tablet") {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    }
  }, []);

  React.useEffect(() => {
    if (
      !IS_VIEW &&
      fileInfo &&
      fileInfo.viewAccessibility.WebRestrictedEditing &&
      fileInfo.security.FillForms &&
      fileInfo.rootFolderType === FolderType.Rooms &&
      !fileInfo.security.Edit &&
      !config.document.isLinkedForMe
    ) {
      try {
        initForm(fileInfo.id);
      } catch (err) {
        console.error(err);
      }
    }
  }, [config.document.isLinkedForMe, fileInfo]);

  React.useEffect(() => {
    if (!config) return;

    setDocumentTitle(
      config.document.title,
      config.document.fileType,
      documentReady,
      successAuth,
      setDocTitle,
    );
  }, [config, documentReady, fileInfo, setDocTitle, successAuth]);

  React.useEffect(() => {
    if (config && IS_DESKTOP_EDITOR) {
      initDesktop(config, user, fileInfo.id, t);
    }
  }, [config, fileInfo.id, t, user]);

  React.useEffect(() => {
    try {
      const url = window.location.href;

      if (
        successAuth &&
        url.indexOf("#message/") > -1 &&
        fileInfo &&
        fileInfo?.fileExst &&
        fileInfo?.viewAccessibility?.MustConvert &&
        fileInfo?.security?.Convert
      ) {
        showDocEditorMessage(url, fileInfo.id);
      }
    } catch (err) {
      console.error(err);
    }
  }, [fileInfo, successAuth]);

  return {};
};

export default useInit;
