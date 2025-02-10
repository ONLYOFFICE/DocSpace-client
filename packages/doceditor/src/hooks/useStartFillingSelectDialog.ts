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
import { useCallback, useRef, useState } from "react";

import { ConflictResolveType } from "@docspace/shared/enums";
import {
  checkFileConflicts,
  copyToFolder,
  getProgress,
} from "@docspace/shared/api/files";
// import { getOperationProgress } from "@docspace/shared/utils/getOperationProgress";
import { toastr } from "@docspace/shared/components/toast";
import { CREATED_FORM_KEY, EDITOR_ID } from "@docspace/shared/constants";

import type {
  TFile,
  TFileSecurity,
  TFolder,
  TFolderSecurity,
  TOperation,
} from "@docspace/shared/api/files/types";
import type { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import type { TBreadCrumb } from "@docspace/shared/components/selector/Selector.types";
import type { TSelectedFileInfo } from "@docspace/shared/selectors/Files/FilesSelector.types";
import type { TData } from "@docspace/shared/components/toast/Toast.type";

// import { useTranslation } from "react-i18next";
import { saveAs } from "@/utils";
import type { ConflictStateType } from "@/types";

type SuccessResponseType = {
  form: TFile;
  message: string;
};
type FaildResponseType = string;
type ResponseType = SuccessResponseType | FaildResponseType;

const DefaultConflictDataDialogState: ConflictStateType = {
  visible: false,
  resolve: () => {},
  reject: () => {},
  fileName: "",
  folderName: "",
};

const hasFileUrl = (arg: object): arg is { data: { url: string } } => {
  return (
    "data" in arg &&
    typeof arg.data === "object" &&
    arg.data !== null &&
    "url" in arg.data &&
    typeof arg.data.url === "string"
  );
};

const isSuccessResponse = (
  res: ResponseType | undefined,
): res is SuccessResponseType => {
  return Boolean(res) && typeof res === "object" && "form" in res;
};

const useStartFillingSelectDialog = (fileInfo: TFile | undefined) => {
  // const { t } = useTranslation(["Common"]);
  const resolveRef = useRef<(value: string | PromiseLike<string>) => void>();

  const [headerLabelSFSDialog, setHeaderLabelSFSDialog] = useState("");

  const [isVisible, setIsVisible] = useState(false);
  const [conflictDataDialog, setConflictDataDialog] = useState(
    DefaultConflictDataDialogState,
  );

  const requestRunning = useRef(false);

  const onSDKRequestStartFilling = useCallback((headerLabel: string) => {
    setHeaderLabelSFSDialog(headerLabel);
    setIsVisible(true);
  }, []);

  const onClose = () => {
    if (requestRunning.current) return;
    setIsVisible(false);
  };

  const closeConflictResolveDialog = () => {
    setConflictDataDialog(DefaultConflictDataDialogState);
  };

  const showConflictResolveDialog = async (
    folderName: string,
    fileName: string,
  ) => {
    try {
      return await new Promise<ConflictResolveType>((resolve, reject) => {
        setConflictDataDialog({
          visible: true,
          resolve,
          reject,
          folderName,
          fileName,
        });
      });
    } catch (error) {
      console.log(error);
    } finally {
      closeConflictResolveDialog();
    }
  };

  const onDownloadAs = (obj: object) => {
    if (hasFileUrl(obj)) {
      resolveRef.current?.(obj.data.url);
      resolveRef.current = undefined;
    }
  };

  const getFileUrl = async () => {
    const docEditor =
      typeof window !== "undefined" && window.DocEditor?.instances[EDITOR_ID];

    docEditor?.downloadAs("pdf");

    const url = await new Promise<string>((resolve) => {
      resolveRef.current = resolve;
    });

    return url;
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
    if (!fileInfo || !selectedItemId) return;
    requestRunning.current = true;

    let conflictResolve: ConflictResolveType | void =
      ConflictResolveType.Duplicate;

    const url = new URL(`${window.location.origin}/rooms/shared/filter`);
    url.searchParams.set("folder", selectedItemId.toString());

    try {
      // const hasConfictFiles = await checkFileConflicts(
      //   selectedItemId,
      //   [],
      //   [fileInfo.id],
      // );

      // if (hasConfictFiles.length > 0) {
      //   conflictResolve = await showConflictResolveDialog(
      //     folderTitle,
      //     fileInfo.title,
      //   );

      //   if (!conflictResolve) {
      //     requestRunning.current = false;

      //     return Promise.resolve();
      //   }
      // }

      const fileUrl = await getFileUrl();

      const response = await saveAs<ResponseType>(
        fileInfo.title,
        fileUrl,
        selectedItemId,
        false,
        "createForm",
      );

      if (isSuccessResponse(response)) {
        const { form } = response;

        sessionStorage.setItem(CREATED_FORM_KEY, JSON.stringify(form));
      }

      const [key, value] =
        typeof response === "string" ? response.split(":") : [];

      // await copyToFolder(
      //   Number(selectedItemId),
      //   [],
      //   [fileInfo.id],
      //   conflictResolve,
      //   false,
      // );

      // const error = await new Promise((resolve) => {
      //   const interval = setInterval(async () => {
      //     const [progress] = await getProgress();

      //     if (progress?.finished) {
      //       clearInterval(interval);
      //       resolve(progress.error);
      //     }
      //   }, 1000);
      // });

      if (key === "error") {
        toastr.error(value);
      } else {
        window.location.replace(url.toString());
        onClose();
      }
    } catch (e) {
      toastr.error(e as TData);
      onClose();
    } finally {
      requestRunning.current = false;
    }
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
    if (selectedItemType === "rooms" || isRoot) return true;

    if (isFirstLoad) return true;
    if (requestRunning.current) return true;
    if (!!selectedFileInfo) return true;

    if (!selectedItemSecurity) return false;

    return "CopyTo" in selectedItemSecurity
      ? !selectedItemSecurity?.CopyTo
      : !selectedItemSecurity.Copy;
  };

  return {
    onSDKRequestStartFilling,
    onSubmitStartFillingSelectDialog: onSubmit,
    onCloseStartFillingSelectDialog: onClose,
    getIsDisabledStartFillingSelectDialog: getIsDisabled,
    onDownloadAs,
    isVisibleStartFillingSelectDialog: isVisible,
    conflictDataDialog,
    headerLabelSFSDialog,
  };
};

export default useStartFillingSelectDialog;
