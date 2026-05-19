/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

"use client";

import { useCallback, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { FormFillingManageAction, RoomsType } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";
import { CREATED_FORM_KEY, EDITOR_ID } from "@docspace/shared/constants";
import { getFileInfo, manageFormFilling } from "@docspace/shared/api/files";

import type {
  TFile,
  TFileSecurity,
  TFolder,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import type { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import type { TBreadCrumb } from "@docspace/ui-kit/components/selector";
import type { TSelectedFileInfo } from "@docspace/ui-kit/selectors/Files/FilesSelector.types";
import type { TData } from "@docspace/ui-kit/components/toast";

import { saveAs } from "@/utils";
import type { ConflictStateType } from "@/types";
import { Link, LinkTarget } from "@docspace/ui-kit/components/link";

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
                await manageFormFilling(form.id, FormFillingManageAction.Start);

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
