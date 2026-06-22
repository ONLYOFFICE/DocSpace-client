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
 * Creative Commons Attribution-ShareAlike 4.0 International License.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/ui-kit/components/toast";
import getFilesFromEvent from "@docspace/shared/utils/get-files-from-event";
import type { TTranslation } from "@docspace/shared/types";

const FOLDER_INPUT_ATTRS = {
  webkitdirectory: "",
  mozdirectory: "",
} as Record<string, string>;

type UploadFileInputsProps = {
  startUpload?: (files: File[], folderId: null, t: TTranslation) => void;
  createFoldersTree?: (t: TTranslation, files: File[]) => Promise<File[]>;
  isAIRoom?: boolean;
  extsFilesVectorized?: string[];
};

const UploadFileInputs = ({
  startUpload,
  createFoldersTree,
  isAIRoom,
  extsFilesVectorized,
}: UploadFileInputsProps) => {
  const { t } = useTranslation(["Common"]);

  const onFileChange = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = await getFilesFromEvent(e);

      createFoldersTree?.(t, files)
        .then((tree) => {
          if (tree.length > 0) startUpload?.(tree, null, t);
        })
        .catch((err) => {
          toastr.error(err, null, 0, true);
        });
    },
    [createFoldersTree, startUpload, t],
  );

  const onInputClick = React.useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      (e.target as HTMLInputElement).value = "";
    },
    [],
  );

  return (
    <>
      <input
        id="customFileInput"
        className="custom-file-input custom-file-input-article"
        multiple
        type="file"
        style={{ display: "none" }}
        onChange={onFileChange}
        onClick={onInputClick}
        {...(isAIRoom && extsFilesVectorized
          ? { accept: extsFilesVectorized.join(",") }
          : {})}
      />
      <input
        id="customPDFInput"
        className="custom-file-input"
        multiple
        type="file"
        accept=".pdf"
        style={{ display: "none" }}
        onChange={onFileChange}
        onClick={onInputClick}
      />
      <input
        id="customFolderInput"
        className="custom-file-input"
        type="file"
        style={{ display: "none" }}
        onChange={onFileChange}
        onClick={onInputClick}
        {...FOLDER_INPUT_ATTRS}
      />
    </>
  );
};

export default inject(
  ({
    uploadDataStore,
    filesActionsStore,
    selectedFolderStore,
    filesSettingsStore,
  }: TStore) => ({
    startUpload: uploadDataStore.startUpload,
    createFoldersTree: filesActionsStore.createFoldersTree,
    isAIRoom: selectedFolderStore.isAIRoom,
    extsFilesVectorized: filesSettingsStore.extsFilesVectorized,
  }),
)(observer(UploadFileInputs));
