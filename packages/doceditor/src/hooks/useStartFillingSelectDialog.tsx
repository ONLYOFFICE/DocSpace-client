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
import { Trans, useTranslation } from "react-i18next";

import { RoomsType } from "@docspace/shared/enums";
import { toastr } from "@docspace/shared/components/toast";
import { CREATED_FORM_KEY, EDITOR_ID } from "@docspace/shared/constants";
import { getFileInfo } from "@docspace/shared/api/files";

import type {
  TFile,
  TFileSecurity,
  TFolder,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import type { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import type { TBreadCrumb } from "@docspace/shared/components/selector/Selector.types";
import type { TSelectedFileInfo } from "@docspace/shared/selectors/Files/FilesSelector.types";
import type { TData } from "@docspace/shared/components/toast/Toast.type";

import { saveAs } from "@/utils";
import type { ConflictStateType } from "@/types";
import { Link, LinkTarget } from "@docspace/shared/components/link";

type SuccessResponse = `${string}form:${string}`;
type FailedResponseType = string;
type ResponseType = SuccessResponse | FailedResponseType;

type SuccessResponseType = {
  form: TFile;
  message: string;
};

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
): res is SuccessResponse => {
  return !!res && res.includes("form");
};

const useStartFillingSelectDialog = (
  fileInfo: TFile | undefined,
  openAssignRolesDialog: (form: TFile, roomName: string) => void,
) => {
  const { t } = useTranslation(["Common"]);
  const resolveRef =
    useRef<(value: string | PromiseLike<string>) => void>(undefined);

  const [createDefineRoomType, setCreateDefineRoomType] = useState<RoomsType>(
    RoomsType.FormRoom,
  );

  const [headerLabelSFSDialog, setHeaderLabelSFSDialog] = useState("");

  const [isVisible, setIsVisible] = useState(false);

  const requestRunning = useRef(false);

  const onSDKRequestStartFilling = useCallback(
    (headerLabel: string, formType: RoomsType = RoomsType.FormRoom) => {
      setHeaderLabelSFSDialog(headerLabel);
      setIsVisible(true);
      setCreateDefineRoomType(formType);
    },
    [],
  );

  const onClose = useCallback(() => {
    if (requestRunning.current) return;
    setIsVisible(false);
  }, []);

  const onDownloadAs = (obj: object) => {
    if (hasFileUrl(obj)) {
      resolveRef.current?.(obj.data.url);
      resolveRef.current = undefined;
    }
  };

  const getFileUrl = useCallback(async () => {
    const docEditor =
      typeof window !== "undefined" && window.DocEditor?.instances[EDITOR_ID];

    docEditor?.downloadAs("pdf");

    const url = await new Promise<string>((resolve) => {
      resolveRef.current = resolve;
    });

    return url;
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
    ) => {
      if (!fileInfo || !selectedItemId) return;
      requestRunning.current = true;

      try {
        const [fileUrl, file] = await Promise.all([
          getFileUrl(),
          getFileInfo(fileInfo.id),
        ]);

        const response = await saveAs(
          file.title,
          fileUrl,
          selectedItemId,
          false,
          "createForm",
        );

        if (isSuccessResponse(response)) {
          const res = JSON.parse(response) as SuccessResponseType;

          const { form } = res;

          switch (createDefineRoomType) {
            case RoomsType.FormRoom:
              {
                sessionStorage.setItem(CREATED_FORM_KEY, JSON.stringify(form));

                const url = new URL(
                  `${window.location.origin}/rooms/shared/filter`,
                );
                url.searchParams.set("folder", selectedItemId.toString());
                window.location.replace(url.toString());
              }

              break;
            case RoomsType.VirtualDataRoom:
              {
                const url = new URL(
                  `${window.location.origin}/rooms/shared/filter`,
                );
                url.searchParams.set("folder", selectedItemId.toString());

                const components = {
                  1: (
                    <Link
                      tag="a"
                      href={url.toString()}
                      target={LinkTarget.blank}
                      textDecoration="underline"
                      color="accent"
                    />
                  ),
                  2: <strong />,
                };

                const values = {
                  folderName: selectedTreeNode.title,
                  title: form.title,
                };

                toastr.success(
                  <Trans
                    t={t}
                    ns="Common"
                    i18nKey="CopyItem"
                    values={values}
                    components={components}
                  />,
                );

                openAssignRolesDialog(form, selectedTreeNode.title);
              }
              break;
            default:
              break;
          }

          return;
        }

        const [key, value] =
          typeof response === "string" ? response.split(":") : [];

        if (key === "error") {
          toastr.error(value);
        }
      } catch (e) {
        toastr.error(e as TData);
      } finally {
        onClose();
        requestRunning.current = false;
      }
    },
    [
      createDefineRoomType,
      fileInfo,
      getFileUrl,
      onClose,
      openAssignRolesDialog,
      t,
    ],
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
      if (selectedItemType === "rooms" || isRoot) return true;

      if (isFirstLoad) return true;
      if (requestRunning.current) return true;
      if (selectedFileInfo) return true;

      if (!selectedItemSecurity) return false;

      return "CopyTo" in selectedItemSecurity
        ? !selectedItemSecurity?.CopyTo
        : !selectedItemSecurity.Copy;
    },
    [],
  );

  return {
    createDefineRoomType,
    onSDKRequestStartFilling,
    onSubmitStartFillingSelectDialog: onSubmit,
    onCloseStartFillingSelectDialog: onClose,
    getIsDisabledStartFillingSelectDialog: getIsDisabled,
    onDownloadAs,
    isVisibleStartFillingSelectDialog: isVisible,
    conflictDataDialog: DefaultConflictDataDialogState,
    headerLabelSFSDialog,
  };
};

export default useStartFillingSelectDialog;
