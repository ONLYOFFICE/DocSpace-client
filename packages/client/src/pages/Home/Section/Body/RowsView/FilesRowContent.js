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

import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import styled, { css } from "styled-components";
import {
  isMobile,
  isTablet,
  mobile,
  tablet,
  desktop,
} from "@docspace/shared/utils";

import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import { RowContent } from "@docspace/shared/components/row-content";

import withContent from "../../../../../HOCs/withContent";

import { Base } from "@docspace/shared/themes";

import {
  connectedCloudsTypeTitleTranslation,
  getFileTypeName,
  getRoomTypeName,
} from "../../../../../helpers/filesUtils";
import { SortByFieldName } from "SRC_DIR/helpers/constants";
import { getSpaceQuotaAsText } from "@docspace/shared/utils/common";

const StyledLink = styled(Link)`
  width: 100%;
  text-decoration: none;

  padding-block: 12px 0;
  padding-inline: 0 12px;
  margin-top: ${(props) =>
    props.theme.interfaceDirection === "rtl" ? "-14px" : "-12px"};

  &:hover {
    text-decoration: none;
  }
`;

const SimpleFilesRowContent = styled(RowContent)`
  .row-main-container-wrapper {
    width: 100%;
    max-width: min-content;
    min-width: inherit;
    margin-inline-end: 0;

    @media ${desktop} {
      margin-top: 0px;
    }
  }

  .row_update-text {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .new-items {
    min-width: 12px;
    width: max-content;
    margin: 0 -2px -2px;
  }

  .badge-version {
    width: max-content;
    margin-block: -2px;
    margin-inline: -2px 6px;
  }

  .bagde_alert {
    margin-inline-end: 8px;
  }

  .badge-new-version {
    width: max-content;
  }

  .item-file-exst {
    color: ${(props) => props.theme.filesSection.tableView.fileExstColor};
  }

  @media ${tablet} {
    .row-main-container-wrapper {
      display: flex;
      justify-content: space-between;
      max-width: inherit;
      gap: 8px;

      .rowMainContainer {
        margin-inline-end: 0;
      }

      flex-direction: ${(props) =>
        props.theme.interfaceDirection === "rtl" ? "row-reverse" : "row"};
    }

    .badges {
      flex-direction: row-reverse;
    }

    .tablet-badge {
      margin-top: 5px;
    }

    .tablet-edit,
    .can-convert {
      margin-top: 6px;
      margin-inline-end: 24px;
    }

    .badge-version {
      margin-inline-end: 22px;
    }

    .new-items {
      min-width: 16px;
      margin-block: 5px 0;
      margin-inline: 0 24px;
    }
  }

  @media ${mobile} {
    .row-main-container-wrapper {
      justify-content: flex-start;

      flex-direction: ${(props) =>
        props.theme.interfaceDirection === "rtl" ? "row-reverse" : "row"};
    }

    .additional-badges {
      margin-top: 0;
    }

    .tablet-edit,
    .new-items,
    .tablet-badge {
      margin: 0;
    }

    .can-convert {
      margin: 0 1px;
    }
  }
`;

SimpleFilesRowContent.defaultProps = { theme: Base };

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
  isStatisticsAvailable,
  showStorageInfo,
  isIndexing,
  displayFileExtension,
}) => {
  const {
    contentLength,
    fileExst,
    filesCount,
    foldersCount,
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
        return getFileTypeName(fileType);

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

  // const additionalComponent = () => {
  //   if (isRooms) return getRoomTypeName(item.roomType, t);

  //   if (!fileExst && !contentLength && !providerKey)
  //     return `${foldersCount} ${t("Translations:Folders")} | ${filesCount} ${t(
  //       "Translations:Files",
  //     )}`;

  //   if (fileExst) return `${fileExst.toUpperCase().replace(/^\./, "")}`;

  //   return "";
  // };

  // const additionalInfo = additionalComponent();

  const mainInfo = contentComponent();

  return (
    <StyledLink
      className="row-content-link"
      type="page"
      target="_blank"
      {...linkStyles}
      dir="auto"
    >
      <SimpleFilesRowContent
        sectionWidth={sectionWidth}
        isMobile={!isTablet()}
        isFile={fileExst || contentLength}
        sideColor={theme.filesSection.rowView.sideColor}
      >
        <Text fontSize="15px" fontWeight={600} className="row_update-text">
          {titleWithoutExt}
          {displayFileExtension && (
            <span className="item-file-exst">{fileExst}</span>
          )}
        </Text>

        <div className="badges">
          {badgesComponent}
          {!isRoom && !isRooms && quickButtons}
        </div>

        {isIndexing && (
          <Text
            containerMinWidth="200px"
            containerWidth="15%"
            fontSize="12px"
            fontWeight={400}
            className="row_update-text"
          >
            {`${t("Files:Index")} ${order}`}
          </Text>
        )}
        {mainInfo && (
          <Text
            containerMinWidth="200px"
            containerWidth="15%"
            fontSize="12px"
            fontWeight={400}
            className="row_update-text"
          >
            {mainInfo}
          </Text>
        )}

        {/* {additionalInfo && (
          <Text
            containerMinWidth="90px"
            containerWidth="10%"
            as="div"
            className="row-content-text"
            fontSize="12px"
            fontWeight={400}
            truncate={true}
          >
            {additionalInfo}
          </Text>
        )} */}
      </SimpleFilesRowContent>
    </StyledLink>
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
