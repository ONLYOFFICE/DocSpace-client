"use client";

import React, { useState, useCallback } from "react";

import { EDITOR_ID } from "@docspace/shared/constants";
import { TBreadCrumb } from "@docspace/shared/components/selector/Selector.types";
import {
  TFileSecurity,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import { TSelectedFileInfo } from "@docspace/shared/selectors/Files/FilesSelector.types";

import { TEventData, UseSelectFolderDialogProps } from "@/types";
import { saveAs } from "@/utils";

const useSelectFolderDialog = ({}: UseSelectFolderDialogProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [extension, setExtension] = useState("");

  const requestRunning = React.useRef(false);

  const onSDKRequestSaveAs = useCallback((event: object) => {
    if ("data" in event) {
      const data = event.data as TEventData;
      setTitle(data.title);
      setUrl(data.url);
      setExtension(data.fileType);

      setIsVisible(true);
    }
  }, []);

  const onClose = () => setIsVisible(false);

  const onSubmit = async (
    selectedItemId: string | number | undefined,
    folderTitle: string,
    isPublic: boolean,
    breadCrumbs: TBreadCrumb[],
    fileName: string,
    isChecked: boolean,
  ) => {
    if (!selectedItemId || requestRunning.current) return;
    requestRunning.current = true;

    const currentExst = fileName.split(".").pop();

    const title =
      currentExst !== extension ? fileName.concat(`.${extension}`) : fileName;

    if (isChecked) {
      saveAs(title, url, selectedItemId, isChecked);
    } else {
      const savingInfo = await saveAs(title, url, selectedItemId, isChecked);

      if (savingInfo) {
        const docEditor =
          typeof window !== "undefined" &&
          window.DocEditor?.instances[EDITOR_ID];

        const convertedInfo = savingInfo.split(": ").pop();

        docEditor?.showMessage(convertedInfo);
      }
    }
    requestRunning.current = false;
    onClose();
  };

  const getIsDisabled = (
    isFirstLoad: boolean,
    isSelectedParentFolder: boolean,
    selectedItemId: string | number | undefined,
    selectedItemType: "rooms" | "files" | undefined,
    isRoot: boolean,
    selectedItemSecurity:
      | TFileSecurity
      | TFolderSecurity
      | TRoomSecurity
      | undefined,
    selectedFileInfo: TSelectedFileInfo,
  ) => {
    if (isFirstLoad) return true;
    if (requestRunning.current) return true;
    if (!!selectedFileInfo) return true;

    if (!selectedItemSecurity) return false;

    return "CopyTo" in selectedItemSecurity
      ? !selectedItemSecurity?.CopyTo
      : !selectedItemSecurity.Copy;
  };

  return {
    onSDKRequestSaveAs,
    onSubmitSelectFolderDialog: onSubmit,
    onCloseSelectFolderDialog: onClose,
    getIsDisabledSelectFolderDialog: getIsDisabled,
    isVisibleSelectFolderDialog: isVisible,
    titleSelectorFolderDialog: title,
  };
};

export default useSelectFolderDialog;
