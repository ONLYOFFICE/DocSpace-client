// (c) Copyright Ascensio System SIA 2009-2024
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

import { useState, useEffect } from "react";
// import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { DeviceType, FolderType } from "@docspace/shared/enums";
import FilesSelector from "@docspace/shared/selectors/Files";
import { InputSize } from "@docspace/shared/components/text-input";
import { FileInput } from "@docspace/shared/components/file-input";
import { Portal } from "@docspace/shared/components/portal";
import { Aside } from "@docspace/shared/components/aside";
import { Backdrop } from "@docspace/shared/components/backdrop";

import type { TBreadCrumb } from "@docspace/shared/components/selector/Selector.types";
import type { FilesSelectorProps } from "@docspace/shared/selectors/Files/FilesSelector.types";

import { StyledBodyWrapper } from "./FilesSelectorInput.styled";
import {
  getAcceptButtonLabel,
  getHeaderLabel,
  getIsDisabled,
} from "./FilesSelector.helpers";

import type {
  FileInfoType,
  FilesSelectorInputProps,
} from "./FilesSelectorInput.types";

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
}: FilesSelectorInputProps) => {
  const { t } = useTranslation("Common");

  const isFilesSelection = !!filterParam;

  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id && !withoutInitPath);
  // const [isRequestRunning, setIsRequestRunning] = useState<boolean>(false);

  useEffect(() => {
    return () => toDefault();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const headerLabel = getHeaderLabel(t, isSelect, filterParam, isSelectFolder);
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
  ) => {
    return getIsDisabled(
      isFirstLoad,
      isSelectedParentFolder,
      selectedItemType === "rooms",
      isRoot,
      filterParam,
      !!selectedFileInfo,
      id === Number(selectedItemId),
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
    <>
      <Backdrop
        visible={isPanelVisible}
        isAside
        withBackground
        zIndex={309}
        onClick={onClose}
      />
      <Aside
        visible={isPanelVisible}
        withoutBodyScroll
        zIndex={310}
        onClose={onClose}
        withoutHeader
      >
        <FilesSelector
          withHeader
          withSearch
          withBreadCrumbs
          withoutBackButton
          withCancelButton
          openRoot={openRoot}
          isRoomsOnly={isRoomsOnly}
          headerLabel={headerLabel}
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
        />
      </Aside>
    </>
  );

  return (
    <StyledBodyWrapper maxWidth={maxWidth} className={className}>
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
        placeholder={t("SelectAction")}
      />
      <Portal
        visible={isPanelVisible}
        element={<div>{selectorComponent}</div>}
      />
    </StyledBodyWrapper>
  );
};

export default FilesSelectorInput;

// export default inject(({ filesSelectorInput }) => {
//   const { basePath, newPath, setNewPath, setBasePath, toDefault, isErrorPath } =
//     filesSelectorInput;

//   return {
//     isErrorPath,
//     setBasePath,
//     basePath,
//     newPath,
//     setNewPath,
//     toDefault,
//   };
// })(withTranslation(["Common"])(observer(FilesSelectorInput)));
