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
import styled, { css } from "styled-components";
import { getRoomTypeTitleTranslation } from "@docspace/shared/components/room-type/RoomType.utils";

import { LinkWithTooltip as Link } from "@docspace/shared/components/link";
import { TextWithTooltip as Text } from "@docspace/shared/components/text";
import { createPluginFileHandlers } from "@docspace/shared/utils/plugin-file-utils";

import { DeviceType } from "@docspace/shared/enums";
import { tablet } from "@docspace/shared/utils";
import { TileContent } from "@docspace/shared/components/tiles";
import withContent from "../../../../../HOCs/withContent";
import withBadges from "../../../../../HOCs/withBadges";

const SimpleFilesTileContent = styled(TileContent)`
  .row-main-container {
    height: auto;
    max-width: 100%;
    display: flex;
    align-items: flex-end;
  }

  ${(props) =>
    props.isTemplate &&
    css`
      overflow: hidden;

      .row-main-container {
        flex-direction: column;
        align-items: start;
      }
    `}

  .main-icons {
    align-self: flex-end;
  }

  .badge {
    margin-inline-end: 8px;
    cursor: pointer;
    height: 16px;
    width: 16px;
  }

  .new-items {
    position: absolute;
    inset-inline-end: 29px;
    top: 19px;
  }

  .badges {
    display: flex;
    align-items: center;
  }

  .share-icon {
    margin-top: -4px;
    padding-inline-end: 8px;
  }

  .favorite,
  .can-convert,
  .edit {
    svg:not(:root) {
      width: 14px;
      height: 14px;
    }
  }

  .item-file-name {
    max-height: 100%;
    line-height: ${(props) => (props.isRooms ? "22px" : "20px")};

    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    text-align: start;

    font-size: ${(props) =>
      (props.isRooms && "16px") ||
      (!props.isRooms && props.currentDeviceType === DeviceType.desktop
        ? "13px"
        : "14px")};
  }

  .item-file-exst {
    color: ${(props) => props.theme.filesSection.tableView.fileExstColor};
  }

  ${({ isRooms, isTemplate }) =>
    isRooms ||
    (isTemplate &&
      css`
        .item-file-name {
          font-size: 16px;
        }
      `)}

  @media ${tablet} {
    display: inline-flex;
    height: auto;

    & > div {
      margin-top: 0;
    }
  }
`;

const FilesTileContent = ({
  t,
  item,
  titleWithoutExt,
  linkStyles,
  theme,
  isRooms,
  currentDeviceType,
  displayFileExtension,
}) => {
  const { fileExst, title, isTemplate } = item;

  const roomType = getRoomTypeTitleTranslation(t, item.roomType);

  let linkProps = { ...linkStyles };

  if (item?.isPlugin) {
    linkProps = createPluginFileHandlers(item, linkProps);
  }

  return (
    <SimpleFilesTileContent
      sideColor={theme.filesSection.tilesView.sideColor}
      isFile={fileExst}
      isRooms={isRooms}
      isTemplate={isTemplate}
      currentDeviceType={currentDeviceType}
    >
      <Link
        className="item-file-name"
        containerWidth="100%"
        type="page"
        title={title}
        fontWeight={isTemplate ? 700 : 600}
        target="_blank"
        {...linkProps}
        color={theme.filesSection.tilesView.color}
        isTextOverflow
        dir="auto"
        view="tile"
      >
        {titleWithoutExt}
        {displayFileExtension ? (
          <span className="item-file-exst">{fileExst}</span>
        ) : null}
      </Link>
      {isTemplate ? (
        <Text
          className="item-file-sub-name"
          color={theme.filesSection.tilesView.subTextColor}
          fontSize="13px"
          fontWeight={400}
          truncate
        >
          {roomType}
        </Text>
      ) : null}
    </SimpleFilesTileContent>
  );
};

export default inject(({ settingsStore, treeFoldersStore }) => {
  const { isRoomsFolder, isArchiveFolder, isTemplatesFolder } =
    treeFoldersStore;

  const isRooms = isRoomsFolder || isArchiveFolder;

  return {
    theme: settingsStore.theme,
    currentDeviceType: settingsStore.currentDeviceType,
    isRooms,
    isTemplate: isTemplatesFolder,
  };
})(
  observer(
    withTranslation(["Files", "Translations", "Notifications"])(
      withContent(withBadges(FilesTileContent)),
    ),
  ),
);
