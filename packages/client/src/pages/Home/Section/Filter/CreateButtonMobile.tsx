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

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { MainButtonMobile } from "@docspace/ui-kit/components/main-button-mobile";
import type {
  ActionOption,
  ButtonOption,
} from "@docspace/ui-kit/components/main-button-mobile/MainButtonMobile.types";
import type { MainButtonProps } from "@docspace/ui-kit/components/main-button/MainButton.types";
import { toastr } from "@docspace/ui-kit/components/toast";
import getFilesFromEvent from "@docspace/shared/utils/get-files-from-event";
import type { TTranslation } from "@docspace/shared/types";

import styles from "./CreateButtonMobile.module.scss";

// React typings don't know about the directory-picker attributes.
const FOLDER_INPUT_ATTRS = {
  webkitdirectory: "",
  mozdirectory: "",
} as Record<string, string>;

type ModelItem = ActionOption & {
  id?: string;
  key: string;
  isSeparator?: boolean;
};

const isUploadItem = (option: ModelItem) =>
  /upload/i.test(option.key ?? "") || /upload/i.test(option.id ?? "");

const withoutSeparators = (list: ModelItem[]) =>
  list.filter((option) => !option.isSeparator);

const splitItems = (items: ModelItem[]) => {
  const firstUploadIndex = items.findIndex(isUploadItem);
  const actionOptions = withoutSeparators(
    firstUploadIndex === -1 ? items : items.slice(0, firstUploadIndex),
  );
  const buttonOptions = (
    firstUploadIndex === -1
      ? []
      : withoutSeparators(items.slice(firstUploadIndex))
  ) as unknown as ButtonOption[];
  return { actionOptions, buttonOptions, hasUpload: buttonOptions.length > 0 };
};

type CreateButtonMobileProps = {
  visible: boolean;
  mainButtonProps?: MainButtonProps;
  startUpload?: (files: File[], folderId: null, t: TTranslation) => void;
  createFoldersTree?: (t: TTranslation, files: File[]) => Promise<File[]>;
};

const CreateButtonMobile = ({
  visible,
  mainButtonProps,
  startUpload,
  createFoldersTree,
}: CreateButtonMobileProps) => {
  const { t } = useTranslation(["Common"]);

  // The hidden inputs the upload actions click (via onUploadAction → getElementById)
  // live here, next to the button, the way the old concept did it in ArticleMainButton.
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

  if (!mainButtonProps) return null;

  const { text, isDropdown, model, onAction } = mainButtonProps;

  const items = isDropdown ? (model as unknown as ModelItem[]) : [];

  const { actionOptions, buttonOptions, hasUpload } = splitItems(items);

  return (
    <>
      {visible ? (
        <MainButtonMobile
          className={styles.createButtonMobile}
          title={text}
          withMenu={isDropdown}
          withoutButton={!hasUpload}
          actionOptions={actionOptions as unknown as ActionOption[]}
          buttonOptions={buttonOptions}
          onClick={isDropdown ? undefined : onAction}
        />
      ) : null}
      {isDropdown ? (
        <>
          <input
            id="customFileInput"
            className="custom-file-input"
            multiple
            type="file"
            style={{ display: "none" }}
            onChange={onFileChange}
            onClick={onInputClick}
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
      ) : null}
    </>
  );
};

export default inject(({ uploadDataStore, filesActionsStore }: TStore) => ({
  startUpload: uploadDataStore.startUpload,
  createFoldersTree: filesActionsStore.createFoldersTree,
}))(observer(CreateButtonMobile));

