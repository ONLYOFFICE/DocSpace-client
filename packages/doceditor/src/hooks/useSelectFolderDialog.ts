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

import React, { useState, useCallback } from "react";

import { EDITOR_ID } from "@docspace/shared/constants";
import { TBreadCrumb } from "@docspace/shared/components/selector/Selector.types";
import {
  TFileSecurity,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import { TSelectedFileInfo } from "@docspace/shared/selectors/Files/FilesSelector.types";

import { TEventData } from "@/types";
import { saveAs } from "@/utils";

const useSelectFolderDialog = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [extension, setExtension] = useState("");

  const requestRunning = React.useRef(false);

  const onSDKRequestSaveAs = useCallback((event: object) => {
    if ("data" in event) {
      const data = event.data as TEventData;

      setTitle(data.title ?? "");
      setUrl(data.url ?? "");
      setExtension(data.fileType ?? "");

      setIsVisible(true);
    }
  }, []);

  const onClose = () => {
    if (requestRunning.current) return;
    setIsVisible(false);
  };

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

    const newTitle =
      currentExst !== extension ? fileName.concat(`.${extension}`) : fileName;

    if (isChecked) {
      saveAs(newTitle, url, selectedItemId, isChecked);
    } else {
      const savingInfo = await saveAs(newTitle, url, selectedItemId, isChecked);

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
    if (selectedFileInfo) return true;

    if (!selectedItemSecurity) return false;

    if ("Create" in selectedItemSecurity && !selectedItemSecurity.Create)
      return true;

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
    extensionSelectorFolderDialog: extension,
  };
};

export default useSelectFolderDialog;
