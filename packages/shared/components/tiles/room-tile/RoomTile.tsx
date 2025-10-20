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

import classNames from "classnames";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Tags } from "../../tags";
import { TagType } from "../../tags/Tags.types";
import { BaseTile } from "../base-tile/BaseTile";
import { TileItem } from "../tile-container/TileContainer.types";

import { RoomTileProps, RoomItem } from "./RoomTile.types";
import styles from "./RoomTile.module.scss";

export const RoomTile = ({
  item,
  checked,
  isActive,
  isEdit,
  children,
  columnCount,
  selectTag,
  selectOption,
  getRoomTypeName,
  thumbnailClick,
  badges,
  onSelect,
  ...rest
}: RoomTileProps) => {
  const childrenArray = React.Children.toArray(children);
  const [RoomsTileContent] = childrenArray;

  const { t } = useTranslation(["Translations"]);
  const checkboxContainerRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);

  const onHover = () => {
    setIsHovered(true);
  };

  const onLeave = () => {
    setIsHovered(false);
  };

  const onRoomClick = (e: React.MouseEvent) => {
    if (
      !e.target ||
      !(e.target instanceof Element) ||
      (!e.target.closest(".checkbox") &&
        !e.target.closest(".tags") &&
        !e.target.closest(".advanced-tag") &&
        !e.target.closest(".badges") &&
        !e.target.closest("#modal-dialog") &&
        !checkboxContainerRef.current?.contains(e.target as Node) &&
        !e.target.closest(".expandButton") &&
        !e.target.closest(".p-contextmenu"))
    ) {
      thumbnailClick?.(e);
    }
  };

  const tags: Array<TagType | string> = [];

  if (item.providerType) {
    tags.push({
      isThirdParty: true,
      icon: item.thirdPartyIcon,
      label: item.providerKey || item.providerType,
      roomType: Number(item.roomType),
      providerType: Number(item.providerType),
      onClick: () =>
        selectOption({
          option: "typeProvider",
          value: item.providerType as string,
        }),
    });
  }

  if (item.tags && item?.tags?.length > 0) {
    tags.push(...item.tags);
  } else {
    tags.push({
      isDefault: true,
      label: getRoomTypeName(item.roomType, t),
      roomType: Number(item.roomType),
      onClick: () =>
        selectOption({
          option: "defaultTypeRoom",
          value: item.roomType,
        }),
    });
  }

  const topContent = (
    <>
      {RoomsTileContent}
      <div>{badges}</div>
    </>
  );

  const handleTagSelect = (tag?: object | undefined) => {
    if (!tag) {
      selectTag(undefined);
      return;
    }
    if ("label" in tag && "roomType" in tag) {
      selectTag(tag as Array<TagType | string>);
    }
  };

  const bottomContent = (
    <Tags
      tags={tags}
      className="room-tags"
      id={item.id.toString()}
      columnCount={columnCount}
      onSelectTag={handleTagSelect}
      key={`tags-${item.id.toString()}`}
      showCreateTag={isHovered || checked}
    />
  );

  const onSelectTileItem = onSelect
    ? (isChecked: boolean, tileItem: TileItem) => {
        onSelect(isChecked, tileItem as RoomItem);
      }
    : undefined;

  const roomTileClassName = classNames(styles.roomTile, {
    [styles.checked]: checked,
    [styles.isActive]: isActive,
    [styles.isEdit]: isEdit,
  });

  return (
    <BaseTile
      {...rest}
      checked={checked}
      isActive={isActive}
      isEdit={isEdit}
      item={item}
      onSelect={onSelectTileItem}
      isHovered={isHovered}
      onHover={onHover}
      onLeave={onLeave}
      topContent={topContent}
      bottomContent={bottomContent}
      className={roomTileClassName}
      checkboxContainerRef={checkboxContainerRef}
      onRoomClick={onRoomClick}
    />
  );
};
