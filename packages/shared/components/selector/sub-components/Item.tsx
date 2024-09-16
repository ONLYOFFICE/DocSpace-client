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
import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import Planet12ReactSvgUrl from "PUBLIC_DIR/images/icons/12/planet.react.svg?url";
import LifetimeRoomIconUrl from "PUBLIC_DIR/images/lifetime-room.react.svg?url";
import { getUserTypeLabel } from "../../../utils/common";
import { Avatar, AvatarRole, AvatarSize } from "../../avatar";
import { Text } from "../../text";
import { Checkbox } from "../../checkbox";
import { RoomIcon } from "../../room-icon";
import { Tooltip } from "../../tooltip";

import { StyledItem } from "../Selector.styled";
import { ItemProps, Data, TSelectorItem } from "../Selector.types";
import { RoomsType } from "../../../enums";
import NewItem from "./NewItem";
import InputItem from "./InputItem";

const compareFunction = (prevProps: ItemProps, nextProps: ItemProps) => {
  const prevData = prevProps.data;
  const prevItems = prevData.items;
  const prevIndex = prevProps.index;

  const nextData = nextProps.data;
  const nextItems = nextData.items;
  const nextIndex = nextProps.index;

  const prevItem = prevItems[prevIndex];
  const nextItem = nextItems[nextIndex];

  return (
    prevItem?.id === nextItem?.id &&
    prevItem?.label === nextItem?.label &&
    prevItem?.isSelected === nextItem?.isSelected &&
    nextData?.inputItemVisible === prevData?.inputItemVisible
  );
};

const Item = React.memo(({ index, style, data }: ItemProps) => {
  const {
    items,
    onSelect,
    isMultiSelect,
    isItemLoaded,
    rowLoader,
    renderCustomItem,
    setInputItemVisible,
    inputItemVisible,
    savedInputValue,
    setSavedInputValue,
  }: Data = data;
  const { t } = useTranslation(["Common"]);

  const isLoaded = isItemLoaded(index);

  const renderItem = () => {
    const item: TSelectorItem = items[index];

    if (!item || (item && !item.id))
      return (
        <div key="row-loader" style={style}>
          {rowLoader}
        </div>
      );

    const {
      label,
      isCreateNewItem,
      onCreateClick,
      hotkey,

      isInputItem,
      defaultInputValue,
      onAcceptInput,
      onCancelInput,
      avatar,
      icon,
      roomType,
      placeholder,
      role,
      isSelected,
      isDisabled,
      status,
      color,
      email,
      isGroup,
      disabledText,
      dropDownItems,
      lifetimeTooltip,
    } = item;

    if (isInputItem) {
      return (
        <InputItem
          defaultInputValue={savedInputValue ?? defaultInputValue}
          onAcceptInput={onAcceptInput}
          onCancelInput={onCancelInput}
          style={style}
          color={color}
          roomType={roomType}
          icon={icon}
          setInputItemVisible={setInputItemVisible}
          setSavedInputValue={setSavedInputValue}
          placeholder={placeholder}
        />
      );
    }

    if (
      isCreateNewItem &&
      (items.length > 2 || (items.length === 2 && !items[1].isInputItem))
    ) {
      return (
        <NewItem
          label={label}
          onCreateClick={onCreateClick}
          dropDownItems={dropDownItems}
          style={style}
          hotkey={hotkey}
          inputItemVisible={inputItemVisible}
        />
      );
    }
    if (isCreateNewItem) {
      return null;
    }

    const showPlanetIcon =
      (item.roomType === RoomsType.PublicRoom ||
        item.roomType === RoomsType.FormRoom ||
        item.roomType === RoomsType.CustomRoom) &&
      item.shared;

    const badgeUrl = showPlanetIcon ? Planet12ReactSvgUrl : null;

    const currentRole = role || AvatarRole.user;

    const typeLabel = getUserTypeLabel(
      role as "owner" | "admin" | "user" | "collaborator" | "manager",
      t,
    );

    const onChangeAction = () => {
      onSelect?.(item, false);
    };

    const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (
        ((e.target instanceof HTMLElement || e.target instanceof SVGElement) &&
          !!e.target.closest(".checkbox")) ||
        isDisabled
      )
        return;

      const isDoubleClick = e.detail === 2;

      onSelect?.(item, isDoubleClick);
    };

    const getContent = () => (
      <Text fontSize="12px" fontWeight={400} noSelect>
        {lifetimeTooltip}
      </Text>
    );

    return (
      <StyledItem
        key={`${label}-${avatar}-${role}`}
        isSelected={isSelected}
        isMultiSelect={isMultiSelect}
        style={style}
        onClick={onClick}
        className="test-22"
        isDisabled={isDisabled}
      >
        {avatar || isGroup ? (
          <Avatar
            className="user-avatar"
            source={avatar ?? ""}
            role={currentRole}
            size={AvatarSize.min}
            isGroup={isGroup}
            userName={isGroup ? label : ""}
          />
        ) : color ? (
          <RoomIcon
            color={color}
            title={label}
            showDefault
            badgeUrl={badgeUrl ?? ""}
            className="item-logo"
          />
        ) : icon ? (
          <RoomIcon
            title={label}
            className="item-logo"
            imgClassName="room-logo"
            imgSrc={icon}
            showDefault={false}
            badgeUrl={badgeUrl ?? ""}
          />
        ) : null}
        {renderCustomItem ? (
          renderCustomItem(label, typeLabel, email, isGroup, status)
        ) : (
          <div className="selector-item_name">
            <Text
              className="label label-disabled"
              fontWeight={600}
              fontSize="14px"
              noSelect
              truncate
              dir="auto"
            >
              {label}
            </Text>

            {lifetimeTooltip && (
              <>
                <ReactSVG
                  data-tooltip-id={`${item.id}_iconTooltip`}
                  className="title-icon"
                  src={LifetimeRoomIconUrl}
                />
                <Tooltip
                  id={`${item.id}_iconTooltip`}
                  place="bottom"
                  getContent={getContent}
                  maxWidth="300px"
                />
              </>
            )}
          </div>
        )}

        {isDisabled && disabledText ? (
          <Text
            className="label disabled-text"
            fontWeight={600}
            fontSize="13px"
            lineHeight="20px"
            noSelect
          >
            {disabledText}
          </Text>
        ) : (
          isMultiSelect && (
            <Checkbox
              className="checkbox"
              isChecked={isSelected}
              isDisabled={isDisabled}
              onChange={onChangeAction}
            />
          )
        )}
      </StyledItem>
    );
  };

  return isLoaded ? renderItem() : <div style={style}>{rowLoader}</div>;
}, compareFunction);

Item.displayName = "Item";
export { Item };
