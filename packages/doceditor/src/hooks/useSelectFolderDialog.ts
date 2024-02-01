"use client";

import { useState } from "react";

import { EDITOR_ID } from "@docspace/shared/constants";
import { TBreadCrumb } from "@docspace/shared/components/selector/Selector.types";
import { TFolder } from "@docspace/shared/api/files/types";
import { TSelectedFileInfo } from "@docspace/shared/selectors/Files/FilesSelector.types";

import { TSaveAsEventData, UseSelectFolderDialogProps } from "@/types";
import { saveAs } from "@/utils";

const useSelectFolderDialog = ({}: UseSelectFolderDialogProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [extension, setExtension] = useState("");

  const onSDKRequestSaveAs = (event: object) => {
    if ("data" in event) {
      const data = event.data as TSaveAsEventData;
      setTitle(data.title);
      setUrl(data.url);
      setExtension(data.fileType);

      setIsVisible(true);
    }
  };

  const onClose = () => setIsVisible(false);

  const onSubmit = async (
    selectedItemId: string | number | undefined,
    folderTitle: string,
    isPublic: boolean,
    breadCrumbs: TBreadCrumb[],
    fileName: string,
    isChecked: boolean,
    selectedTreeNode: TFolder,
    selectedFileInfo: TSelectedFileInfo,
  ) => {
    if (!selectedItemId) return;
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
  };

  return {
    onSDKRequestSaveAs,
    onSubmitSelectFolderDialog: onSubmit,
    onCloseSelectFolderDialog: onClose,
    isVisibleSelectFolderDialog: isVisible,
    titleSelectorFolderDialog: title,
  };
};

export default useSelectFolderDialog;
