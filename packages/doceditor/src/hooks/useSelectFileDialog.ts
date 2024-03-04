import React from "react";

import {
  TFileSecurity,
  TFolder,
  TFolderSecurity,
  TGetReferenceDataRequest,
  TPresignedUri,
} from "@docspace/shared/api/files/types";
import { getPresignedUri, getReferenceData } from "@docspace/shared/api/files";
import { EDITOR_ID } from "@docspace/shared/constants";
import { FilesSelectorFilterTypes } from "@docspace/shared/enums";
import { TSelectedFileInfo } from "@docspace/shared/selectors/Files/FilesSelector.types";
import { TBreadCrumb } from "@docspace/shared/components/selector/Selector.types";
import { TRoomSecurity } from "@docspace/shared/api/rooms/types";

import { TEvent, UseSelectFileDialogProps } from "@/types";

export const insertImageAction = "imageFileType";
export const mailMergeAction = "mailMergeFileType";
export const compareFilesAction = "documentsFileType";
export const setReferenceSourceAction = "referenceSourceType";

const useSelectFileDialog = ({ instanceId }: UseSelectFileDialogProps) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [actionEvent, setActionEvent] = React.useState<TEvent>({} as TEvent);
  const [filesType, setFilesType] = React.useState("");
  const [fileTypeDetection, setFileTypeDetection] = React.useState({
    isSelect: true,
    filterParam: FilesSelectorFilterTypes.IMG,
  });

  const requestRunning = React.useRef(false);

  const onSDKRequestSelectDocument = (event: object) => {
    // console.log("onSDKRequestSelectDocument", { event });
    setActionEvent(event as TEvent);
    setFilesType(compareFilesAction);
    setIsVisible(true);
  };

  const onSDKRequestSelectSpreadsheet = (event: object) => {
    // console.log("onSDKRequestSelectSpreadsheet", { event });
    setActionEvent(event as TEvent);
    setFilesType(mailMergeAction);
    setIsVisible(true);
  };

  const onSDKRequestInsertImage = (event: object) => {
    // console.log("onSDKRequestInsertImage", { event });
    setActionEvent(event as TEvent);
    setFilesType(insertImageAction);
    setIsVisible(true);
  };

  const onSDKRequestReferenceSource = (event: object) => {
    // console.log("onSDKRequestReferenceSource", { event });
    setActionEvent(event as TEvent);
    setFilesType(setReferenceSourceAction);
    setIsVisible(true);
  };

  const insertImage = (link: TPresignedUri) => {
    const token = link.token;

    const docEditor =
      typeof window !== "undefined" && window.DocEditor?.instances[EDITOR_ID];

    docEditor?.insertImage({
      ...actionEvent.data,
      fileType: link.filetype,
      ...(token && { token }),
      url: link.url,
    });
  };

  const mailMerge = (link: TPresignedUri) => {
    const token = link.token;

    const docEditor =
      typeof window !== "undefined" && window.DocEditor?.instances[EDITOR_ID];

    docEditor?.setRequestedSpreadsheet({
      ...actionEvent.data,
      fileType: link.filetype,
      ...(token && { token }),
      url: link.url,
    });
  };

  const compareFiles = (link: TPresignedUri) => {
    const token = link.token;

    const docEditor =
      typeof window !== "undefined" && window.DocEditor?.instances[EDITOR_ID];

    docEditor?.setRequestedDocument({
      ...actionEvent.data,
      fileType: link.filetype,
      ...(token && { token }),
      url: link.url,
    });
  };

  const setReferenceSource = (data: TGetReferenceDataRequest) => {
    const docEditor =
      typeof window !== "undefined" && window.DocEditor?.instances[EDITOR_ID];

    docEditor?.setReferenceSource(data);
  };

  const onSelectFile = async (file: TSelectedFileInfo) => {
    try {
      if (!file) return;

      if (filesType === setReferenceSourceAction) {
        const data = await getReferenceData({
          fileKey: file.id,
          instanceId,
        });

        setReferenceSource(data);
      } else {
        const link = await getPresignedUri(file.id);

        if (filesType === insertImageAction) insertImage(link);
        if (filesType === mailMergeAction) mailMerge(link);
        if (filesType === compareFilesAction) compareFiles(link);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getFileTypeDetection = React.useCallback(() => {
    if (filesType === insertImageAction) {
      return {
        isSelect: true,
        filterParam: FilesSelectorFilterTypes.IMG,
      };
    }
    if (
      filesType === mailMergeAction ||
      filesType === setReferenceSourceAction
    ) {
      return {
        isSelect: true,
        filterParam: FilesSelectorFilterTypes.XLSX,
      };
    }
    if (filesType === compareFilesAction) {
      return {
        isSelect: true,
        filterParam: FilesSelectorFilterTypes.DOCX,
      };
    }

    return {
      isSelect: true,
      filterParam: FilesSelectorFilterTypes.DOCX,
    };
  }, [filesType]);

  React.useEffect(() => {
    if (!filesType) return;

    const typeDet = getFileTypeDetection();

    setFileTypeDetection(typeDet);
  }, [filesType, getFileTypeDetection]);

  const onClose = () => {
    setIsVisible(false);
    setActionEvent({} as TEvent);
  };

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
    requestRunning.current = true;
    await onSelectFile(selectedFileInfo);
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
    if (!selectedFileInfo) return true;

    return false;
  };

  return {
    onSDKRequestSelectDocument,
    onSDKRequestInsertImage,
    onSDKRequestReferenceSource,
    onSDKRequestSelectSpreadsheet,

    onSubmitSelectFileDialog: onSubmit,
    onCloseSelectFileDialog: onClose,

    getIsDisabledSelectFileDialog: getIsDisabled,

    selectFileDialogVisible: isVisible,

    selectFileDialogFileTypeDetection: fileTypeDetection,
  };
};

export default useSelectFileDialog;
