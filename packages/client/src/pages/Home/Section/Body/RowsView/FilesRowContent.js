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

import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { isTablet } from "@docspace/shared/utils";

import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import { SimpleFilesRowContent } from "@docspace/shared/styles/FilesRow.styled";
import { getSpaceQuotaAsText } from "@docspace/shared/utils/common";
import { getFileTypeName } from "@docspace/shared/utils/getFileType";

import { SortByFieldName } from "@docspace/shared/enums";
import withContent from "../../../../../HOCs/withContent";

import { connectedCloudsTypeTitleTranslation } from "../../../../../helpers/filesUtils";

const FilesRowContent = ({
  t,
  item,
  sectionWidth,
  titleWithoutExt,
  updatedDate,
  linkStyles,
  badgesComponent,
  quickButtons,
  theme,
  isRooms,
  isTrashFolder,
  filterSortBy,
  createdDate,
  fileOwner,
  isDefaultRoomsQuotaSet,
  isIndexing,
  displayFileExtension,
}) => {
  const {
    contentLength,
    fileExst,
    providerKey,
    title,
    isRoom,
    daysRemaining,
    fileType,
    tags,
    quotaLimit,
    usedSpace,
    order,
  } = item;

  const contentComponent = () => {
    switch (filterSortBy) {
      case SortByFieldName.Size:
        if (!contentLength) return "";
        return contentLength;

      case SortByFieldName.CreationDate:
        return createdDate;

      case SortByFieldName.Author:
        return fileOwner;

      case SortByFieldName.Type:
        return getFileTypeName(fileType, t);

      case SortByFieldName.Tags:
        if (tags?.length === 0) return "";
        return tags?.map((elem) => {
          return elem;
        });

      case SortByFieldName.UsedSpace:
        if (providerKey)
          return connectedCloudsTypeTitleTranslation(providerKey, t);
        if (usedSpace === undefined) return "";

        return getSpaceQuotaAsText(
          t,
          usedSpace,
          quotaLimit,
          isDefaultRoomsQuotaSet,
        );

      default:
        if (isTrashFolder)
          return t("Files:DaysRemaining", {
            daysRemaining,
          });

        return updatedDate;
    }
  };

  const mainInfo = contentComponent();

  return (
    <SimpleFilesRowContent
      sectionWidth={sectionWidth}
      isMobile={!isTablet()}
      isFile={fileExst || contentLength}
      sideColor={theme.filesSection.rowView.sideColor}
    >
      <Link
        className="row-content-link"
        containerWidth="55%"
        type="page"
        title={title}
        fontWeight="600"
        fontSize="15px"
        target="_blank"
        {...linkStyles}
        isTextOverflow
        dir="auto"
        truncate
      >
        {titleWithoutExt}
        {displayFileExtension ? (
          <span className="item-file-exst">{fileExst}</span>
        ) : null}
      </Link>
      <div className="badges">
        {badgesComponent}
        {!isRoom && !isRooms ? quickButtons : null}
      </div>

      {isIndexing ? (
        <Text
          containerMinWidth="200px"
          containerWidth="15%"
          fontSize="12px"
          fontWeight={400}
          className="row_update-text"
        >
          {`${t("Files:Index")} ${order}`}
        </Text>
      ) : null}
      {mainInfo ? (
        <Text
          containerMinWidth="200px"
          containerWidth="15%"
          fontSize="12px"
          fontWeight={400}
          className="row_update-text"
        >
          {mainInfo}
        </Text>
      ) : null}
    </SimpleFilesRowContent>
  );
};

export default inject(
  ({
    currentQuotaStore,
    settingsStore,
    treeFoldersStore,
    filesStore,
    selectedFolderStore,
  }) => {
    const { filter, roomsFilter } = filesStore;
    const { isRecycleBinFolder, isRoomsFolder, isArchiveFolder } =
      treeFoldersStore;
    const { isIndexedFolder } = selectedFolderStore;

    const isRooms = isRoomsFolder || isArchiveFolder;
    const filterSortBy = isRooms ? roomsFilter.sortBy : filter.sortBy;

    const { isDefaultRoomsQuotaSet, isStatisticsAvailable, showStorageInfo } =
      currentQuotaStore;

    return {
      filterSortBy,
      theme: settingsStore.theme,
      isTrashFolder: isRecycleBinFolder,
      isDefaultRoomsQuotaSet,
      isStatisticsAvailable,
      showStorageInfo,
      isIndexing: isIndexedFolder,
    };
  },
)(
  observer(
    withTranslation(["Files", "Translations", "Notifications", "Common"])(
      withContent(FilesRowContent),
    ),
  ),
);
