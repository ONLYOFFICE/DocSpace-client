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

import React, { useCallback } from "react";

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

  const onSDKRequestSelectDocument = useCallback((event: object) => {
    // console.log("onSDKRequestSelectDocument", { event });
    setActionEvent(event as TEvent);
    setFilesType(compareFilesAction);
    setIsVisible(true);
  }, []);

  const onSDKRequestSelectSpreadsheet = useCallback((event: object) => {
    // console.log("onSDKRequestSelectSpreadsheet", { event });
    setActionEvent(event as TEvent);
    setFilesType(mailMergeAction);
    setIsVisible(true);
  }, []);

  const onSDKRequestInsertImage = useCallback((event: object) => {
    // console.log("onSDKRequestInsertImage", { event });
    setActionEvent(event as TEvent);
    setFilesType(insertImageAction);
    setIsVisible(true);
  }, []);

  const onSDKRequestReferenceSource = useCallback((event: object) => {
    // console.log("onSDKRequestReferenceSource", { event });
    setActionEvent(event as TEvent);
    setFilesType(setReferenceSourceAction);
    setIsVisible(true);
  }, []);

  const insertImage = useCallback(
    (link: TPresignedUri) => {
      const token = link.token;

      const docEditor =
        typeof window !== "undefined" && window.DocEditor?.instances[EDITOR_ID];

      docEditor?.insertImage({
        ...actionEvent.data,
        fileType: link.filetype,
        ...(token && { token }),
        url: link.url,
      });
    },
    [actionEvent],
  );

  const mailMerge = useCallback(
    (link: TPresignedUri) => {
      const token = link.token;

      const docEditor =
        typeof window !== "undefined" && window.DocEditor?.instances[EDITOR_ID];

      docEditor?.setRequestedSpreadsheet({
        ...actionEvent.data,
        fileType: link.filetype,
        ...(token && { token }),
        url: link.url,
      });
    },
    [actionEvent],
  );

  const compareFiles = useCallback(
    (link: TPresignedUri) => {
      const token = link.token;

      const docEditor =
        typeof window !== "undefined" && window.DocEditor?.instances[EDITOR_ID];

      docEditor?.setRequestedDocument({
        ...actionEvent.data,
        fileType: link.filetype,
        ...(token && { token }),
        url: link.url,
      });
    },
    [actionEvent],
  );

  const setReferenceSource = useCallback((data: TGetReferenceDataRequest) => {
    const docEditor =
      typeof window !== "undefined" && window.DocEditor?.instances[EDITOR_ID];

    docEditor?.setReferenceSource(data);
  }, []);

  const onSelectFile = useCallback(
    async (file: TSelectedFileInfo) => {
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
    },
    [
      filesType,
      instanceId,
      setReferenceSource,
      insertImage,
      mailMerge,
      compareFiles,
    ],
  );

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

  const onClose = useCallback(() => {
    if (requestRunning.current) return;
    setIsVisible(false);
    setActionEvent({} as TEvent);
  }, []);

  const onSubmit = useCallback(
    async (
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
    },
    [onClose, onSelectFile],
  );

  const getIsDisabled = useCallback(
    (
      isFirstLoad: boolean,
      isSelectedParentFolder: boolean,
      selectedItemId: string | number | undefined,
      selectedItemType: "rooms" | "files" | "agents" | undefined,
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
    },
    [],
  );

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
