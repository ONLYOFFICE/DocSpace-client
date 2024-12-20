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
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import { Aside } from "@docspace/shared/components/aside";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { FileInput } from "@docspace/shared/components/file-input";
import { Portal } from "@docspace/shared/components/portal";

import FilesSelector from "../FilesSelector";
import { StyledBodyWrapper } from "./StyledComponents";

const FilesSelectorInput = (props) => {
  const {
    t,
    id,
    isThirdParty,
    isRoomsOnly,
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
    withCreate,
    checkCreating,
    openRoot,
  } = props;

  const isFilesSelection = !!filterParam;

  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id && !withoutInitPath);

  useEffect(() => {
    return () => toDefault();
  }, []);

  const onClick = () => {
    setIsPanelVisible(true);
  };

  const onClose = () => {
    setIsPanelVisible(false);
  };

  const onSetBasePath = (folders) => {
    !withoutInitPath && setBasePath(folders);
    isLoading && setIsLoading(false);
  };

  const onSelectFolder = (folderId, folders) => {
    const publicRoomInPath = folders.filter((folder) => folder.roomType === 6);
    setSelectedFolder && setSelectedFolder(folderId, publicRoomInPath[0]);

    folders && setNewPath(folders);
  };

  const onSelectFile = (fileInfo, folders) => {
    setSelectedFile && setSelectedFile(fileInfo);
    folders && setNewPath(folders, fileInfo?.title);
  };

  const filesSelectionProps = {
    onSelectFile: onSelectFile,
    filterParam: filterParam,
  };

  const foldersSelectionProps = {
    onSelectFolder: onSelectFolder,
    onSetBaseFolderPath: onSetBasePath,
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
          isRoomBackup={isRoomBackup}
          descriptionText={descriptionText}
          filterParam={filterParam}
          rootThirdPartyId={rootThirdPartyId}
          isThirdParty={isThirdParty}
          isRoomsOnly={isRoomsOnly}
          isSelectFolder={isSelectFolder}
          id={id}
          onClose={onClose}
          isPanelVisible={isPanelVisible}
          isSelect={isSelect}
          withCreate={withCreate}
          {...(isFilesSelection ? filesSelectionProps : foldersSelectionProps)}
          checkCreating={checkCreating}
          openRoot={openRoot}
        />
      </Aside>
    </>
  );
  return (
    <StyledBodyWrapper maxWidth={maxWidth} className={className}>
      <FileInput
        onClick={onClick}
        fromStorage
        path={newPath || basePath}
        isLoading={isLoading}
        isDisabled={isDisabled || isLoading}
        hasError={isError || isErrorPath}
        scale
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

export default inject(({ filesSelectorInput }) => {
  const { basePath, newPath, setNewPath, setBasePath, toDefault, isErrorPath } =
    filesSelectorInput;

  return {
    isErrorPath,
    setBasePath,
    basePath,
    newPath,
    setNewPath,
    toDefault,
  };
})(withTranslation(["Common"])(observer(FilesSelectorInput)));
