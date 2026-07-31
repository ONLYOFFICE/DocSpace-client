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

import { useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { Portal } from "@docspace/ui-kit/components/portal";

import { DeviceType, FolderType } from "../../enums";
import FilesSelector from "@docspace/ui-kit/selectors/Files";
import { InputSize } from "@docspace/ui-kit/components/text-input";
import { FileInput } from "@docspace/ui-kit/components/file-input";
import { useUnmount } from "@docspace/ui-kit/hooks/useUnmount";

import type { TBreadCrumb } from "@docspace/ui-kit/components/selector";
import type { FilesSelectorProps } from "@docspace/ui-kit/selectors/Files/FilesSelector.types";

import {
  getAcceptButtonLabel,
  // getHeaderLabel,
  getIsDisabled,
} from "./FilesSelector.helpers";

import type {
  FileInfoType,
  FilesSelectorInputProps,
} from "./FilesSelectorInput.types";

import styles from "./FilesSelectorInput.module.scss";

const FilesSelectorInput = ({
  id,
  isThirdParty = false,
  isRoomsOnly = false,
  withCreate = false,
  isSelectFolder,
  setNewPath,
  newPath,
  onSelectFolder: setSelectedFolder,
  onSelectFile: setSelectedFile,
  setBasePath,
  basePath,
  isDisabled,
  isError,
  toDefault,
  maxWidth,
  withoutInitPath,
  rootThirdPartyId,
  isErrorPath,

  filterParam,
  descriptionText,
  className,
  isSelect,
  isRoomBackup,
  isDocumentIcon,
  currentDeviceType,
  setBackupToPublicRoomVisible,
  filesSelectorSettings,
  checkCreating,
  openRoot,
  formProps,
  dataTestId,
  withAIAgentsTreeFolder,
}: FilesSelectorInputProps) => {
  const { t } = useTranslation("Common");

  const isFilesSelection = !!filterParam;

  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id && !withoutInitPath);
  // const [isRequestRunning, setIsRequestRunning] = useState<boolean>(false);

  useUnmount(() => {
    toDefault();
  });

  const onClick = () => {
    setIsPanelVisible(true);
  };

  const onClose = () => {
    setIsPanelVisible(false);
  };

  const onSetBasePath = (
    folders: number | string | undefined | TBreadCrumb[],
  ) => {
    if (!withoutInitPath && Array.isArray(folders)) setBasePath(folders);
    if (isLoading) setIsLoading(false);
  };

  const onSelectFolder = (
    folderId: number | string | undefined,
    folders: TBreadCrumb[],
  ) => {
    const publicRoomInPath = folders.filter((folder) => folder.roomType === 6);
    setSelectedFolder?.(folderId, publicRoomInPath[0]);
    if (folders) setNewPath(folders);
  };

  const onSelectFile = (fileInfo: FileInfoType, folders: TBreadCrumb[]) => {
    setSelectedFile?.(fileInfo);
    if (folders) setNewPath(folders, fileInfo?.title);
  };

  // const headerLabel = getHeaderLabel(t, isSelect, filterParam, isSelectFolder);
  const acceptButtonLabel = getAcceptButtonLabel(
    t,
    isSelect,
    filterParam,
    isSelectFolder,
  );

  const getIsDisabledAction: FilesSelectorProps["getIsDisabled"] = (
    isFirstLoad,
    isSelectedParentFolder,
    selectedItemId,
    selectedItemType,
    isRoot,
    selectedItemSecurity,
    selectedFileInfo,
    isDisabledFolder,
    isInsideKnowledge,
    isInsideResultStorage,
  ) => {
    return getIsDisabled(
      isFirstLoad,
      isSelectedParentFolder,
      selectedItemType === "rooms" || selectedItemType === "agents",
      isRoot,
      filterParam,
      !!selectedFileInfo,
      id === Number(selectedItemId),
      isInsideKnowledge,
      isInsideResultStorage,
    );
  };

  const onSubmit: FilesSelectorProps["onSubmit"] = (
    selectedItemId,
    folderTitle,
    isPublic,
    breadCrumbs,
    fileName,
    isChecked,
    selectedTreeNode,
    selectedFileInfo,
  ) => {
    if (isRoomBackup && isPublic) {
      return setBackupToPublicRoomVisible?.(true, {
        selectedItemId,
        breadCrumbs,
        onSelectFolder,
        onClose,
      });
      // return onClose();
    }

    if (isFilesSelection && selectedFileInfo) {
      onSelectFile(selectedFileInfo, breadCrumbs);
    } else {
      onSelectFolder(selectedItemId, breadCrumbs);
    }

    return onClose();
  };

  const selectorComponent = (
    <FilesSelector
      withSearch
      withBreadCrumbs
      withoutBackButton
      withCancelButton
      openRoot={openRoot}
      isRoomsOnly={isRoomsOnly}
      currentFolderId={id ?? ""}
      filterParam={filterParam}
      checkCreating={checkCreating}
      isThirdParty={isThirdParty}
      isPanelVisible={isPanelVisible}
      rootThirdPartyId={rootThirdPartyId}
      submitButtonLabel={acceptButtonLabel}
      descriptionText={descriptionText ?? ""}
      cancelButtonId="select-file-modal-cancel"
      cancelButtonLabel={t("Common:CancelButton")}
      onCancel={onClose}
      onSubmit={onSubmit}
      onSetBaseFolderPath={onSetBasePath}
      getIsDisabled={getIsDisabledAction}
      withCreate={withCreate}
      formProps={formProps}
      // default
      parentId={0}
      disabledItems={[]}
      embedded={false}
      withFooterInput={false}
      withFooterCheckbox={false}
      footerInputHeader=""
      footerCheckboxLabel=""
      currentFooterInputValue=""
      getFilesArchiveError={() => ""}
      rootFolderType={FolderType.Rooms}
      currentDeviceType={currentDeviceType ?? DeviceType.desktop}
      {...filesSelectorSettings}
      withFavoritesTreeFolder={isFilesSelection}
      withAIAgentsTreeFolder={withAIAgentsTreeFolder}
    />
  );

  return (
    <div
      className={classNames(styles.filesSelectorInput, className)}
      style={{ maxWidth }}
      data-testid={dataTestId ?? "files-selector-input"}
    >
      <FileInput
        scale
        fromStorage
        onClick={onClick}
        size={InputSize.base}
        isLoading={isLoading}
        path={newPath || basePath}
        isDisabled={isDisabled || isLoading}
        hasError={isError || isErrorPath}
        isDocumentIcon={isDocumentIcon}
        placeholder={t("Common:SelectAction")}
      />
      <Portal element={<div>{selectorComponent}</div>} />
    </div>
  );
};

export default FilesSelectorInput;
