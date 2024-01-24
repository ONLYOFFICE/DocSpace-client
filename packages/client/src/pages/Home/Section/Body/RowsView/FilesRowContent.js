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
import { ROOMS_TYPE_TRANSLATIONS } from "@docspace/shared/constants";

import { getFileTypeName } from "../../../../../helpers/filesUtils";
import { SortByFieldName } from "../../../../../helpers/constants";

const SimpleFilesRowContent = styled(RowContent)`
  .row-main-container-wrapper {
    width: 100%;
    max-width: min-content;
    min-width: inherit;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 0px;
          `
        : css`
            margin-right: 0px;
          `}

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
    margin: 0 -2px -2px -2px;
  }

  .badge-version {
    width: max-content;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin: -2px -2px -2px 6px;
          `
        : css`
            margin: -2px 6px -2px -2px;
          `}
  }

  .bagde_alert {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 8px;
          `
        : css`
            margin-right: 8px;
          `}
  }

  .badge-new-version {
    width: max-content;
  }

  .row-content-link {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding: 12px 0px 0px 12px;
          `
        : css`
            padding: 12px 12px 0px 0px;
          `}
    margin-top: ${(props) =>
      props.theme.interfaceDirection === "rtl" ? "-14px" : "-12px"}
  }

  @media ${tablet} {
    .row-main-container-wrapper {
      display: flex;
      justify-content: space-between;
      max-width: inherit;
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
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-left: 24px;
            `
          : css`
              margin-right: 24px;
            `}
    }

    .badge-version {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-left: 22px;
            `
          : css`
              margin-right: 22px;
            `}
    }

    .new-items {
      min-width: 16px;
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin: 5px 0 0 24px;
            `
          : css`
              margin: 5px 24px 0 0;
            `}
    }
  }

  @media ${mobile} {
    .row-main-container-wrapper {
      justify-content: flex-start;
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

    .row-content-link {
      padding: 12px 0px 0px 0px;
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

      default:
        if (isTrashFolder)
          return t("Files:DaysRemaining", {
            daysRemaining,
          });

        return updatedDate;
    }
  };

  return (
    <>
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
          isTextOverflow={true}
          dir="auto"
        >
          {titleWithoutExt}
        </Link>
        <div className="badges">
          {badgesComponent}
          {!isRoom && !isRooms && quickButtons}
        </div>

        <Text
          containerMinWidth="200px"
          containerWidth="15%"
          fontSize="12px"
          fontWeight={400}
          className="row_update-text"
        >
          {contentComponent()}
        </Text>

        <Text
          containerMinWidth="90px"
          containerWidth="10%"
          as="div"
          className="row-content-text"
          fontSize="12px"
          fontWeight={400}
          truncate={true}
        >
          {isRooms
            ? t(ROOMS_TYPE_TRANSLATIONS[item.roomType])
            : !fileExst && !contentLength && !providerKey
              ? `${foldersCount} ${t(
                  "Translations:Folders"
                )} | ${filesCount} ${t("Translations:Files")}`
              : fileExst
                ? `${fileExst.toUpperCase().replace(/^\./, "")}`
                : ""}
        </Text>
      </SimpleFilesRowContent>
    </>
  );
};

export default inject(({ auth, treeFoldersStore, filesStore }) => {
  const { filter, roomsFilter } = filesStore;
  const { isRecycleBinFolder, isRoomsFolder, isArchiveFolder } =
    treeFoldersStore;

  const isRooms = isRoomsFolder || isArchiveFolder;
  const filterSortBy = isRooms ? roomsFilter.sortBy : filter.sortBy;

  return {
    filterSortBy,
    theme: auth.settingsStore.theme,
    isTrashFolder: isRecycleBinFolder,
  };
})(
  observer(
    withTranslation(["Files", "Translations", "Notifications"])(
      withContent(FilesRowContent)
    )
  )
);
