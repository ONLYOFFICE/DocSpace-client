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

import React, { use } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import Planet12ReactSvg from "PUBLIC_DIR/images/icons/12/planet.react.svg";
import LifetimeRoomIcon from "PUBLIC_DIR/images/lifetime-room.react.svg";
import EveryoneIconUrl from "PUBLIC_DIR/images/icons/16/departments.react.svg?url";

import { SettingsContext } from "../../../selectors/utils/contexts/Settings";
import { getUserTypeTranslation } from "../../../utils/common";
import { Avatar, AvatarRole, AvatarSize } from "../../avatar";
import { Text } from "../../text";
import { Checkbox } from "../../checkbox";
import { RoomIcon } from "../../room-icon";
import { Tooltip } from "../../tooltip";
import { MCPIcon, MCPIconSize } from "../../mcp-icon";

import { Data, ItemProps, TSelectorItem } from "../Selector.types";
import { EmployeeType, RoomsType } from "../../../enums";
import NewItem from "./NewItem";
import InputItem from "./InputItem";
import styles from "../Selector.module.scss";
import { useTheme } from "../../../hooks/useTheme";
import { globalColors } from "../../../themes";

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
    nextData?.inputItemVisible === prevData?.inputItemVisible &&
    nextData?.listHeight === prevData?.listHeight &&
    nextData?.isLimitReached === prevData?.isLimitReached
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
    listHeight,
    isLimitReached,
  }: Data = data;
  const { t } = useTranslation(["Common"]);

  const { displayFileExtension } = use(SettingsContext);
  const { isBase } = useTheme();

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
      cover,
      userType,
      fileExst: ext,
      isTemplate,
      disableMultiSelect,
      isSeparator,
      isSystem,
      isMCP,
      isFolder,
    } = item;

    if (isSeparator) {
      return (
        <div style={style}>
          <div
            style={{
              backgroundColor: isBase
                ? globalColors.grayLightMid
                : globalColors.grayDarkStrong,
            }}
            className={styles.selectorSeparator}
          >
            {"\u00A0"}
          </div>
        </div>
      );
    }

    if (isInputItem) {
      return (
        <InputItem
          defaultInputValue={savedInputValue ?? defaultInputValue}
          onAcceptInput={onAcceptInput}
          onCancelInput={onCancelInput}
          style={style}
          color={color}
          roomType={roomType}
          cover={cover}
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
          listHeight={listHeight}
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

    const badgeIconNode = showPlanetIcon ? <Planet12ReactSvg /> : null;

    const currentRole = role || AvatarRole.user;

    const typeLabel = getUserTypeTranslation(
      userType as unknown as EmployeeType,
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

      if (isMultiSelect && isLimitReached && !isSelected && !isFolder) return;

      const isDoubleClick = e.detail === 2;

      onSelect?.(item, isDoubleClick);
    };

    const getContent = () => (
      <Text fontSize="12px" fontWeight={400} noSelect>
        {lifetimeTooltip}
      </Text>
    );

    const itemAvatar = avatar ?? (isGroup && isSystem ? EveryoneIconUrl : "");

    const isItemDisabled =
      isDisabled ||
      (isMultiSelect && isLimitReached && !isSelected && !isFolder);

    return (
      <div
        key={`${label}-${avatar}-${role}`}
        style={style}
        onClick={onClick}
        className={classNames(styles.selectorItem, {
          [styles.disabled]: isItemDisabled,
          [styles.selectedSingle]: isSelected && !isMultiSelect,
          [styles.hoverable]: !isItemDisabled,
          [styles.isSystem]: isSystem,
        })}
        data-testid={`selector-item-${index}`}
      >
        {isMCP ? (
          <MCPIcon title={label} imgSrc={icon} size={MCPIconSize.Big} />
        ) : avatar || isGroup ? (
          <Avatar
            className={styles.userAvatar}
            source={itemAvatar}
            role={currentRole}
            size={AvatarSize.min}
            isGroup={isGroup}
            userName={isGroup ? label : ""}
          />
        ) : cover ? (
          <RoomIcon
            color={color}
            title={label}
            logo={{ cover, large: "", original: "", small: "", medium: "" }}
            showDefault={false}
            badgeIconNode={badgeIconNode ?? undefined}
            className={styles.itemLogo}
            isTemplate={isTemplate}
          />
        ) : color ? (
          <RoomIcon
            color={color}
            title={label}
            showDefault
            badgeIconNode={badgeIconNode ?? undefined}
            className={styles.itemLogo}
            isTemplate={isTemplate}
          />
        ) : icon ? (
          <RoomIcon
            title={label}
            className={styles.itemLogo}
            imgClassName={styles.roomLogo}
            logo={icon}
            showDefault={false}
            badgeIconNode={badgeIconNode ?? undefined}
            isTemplate={isTemplate}
          />
        ) : null}
        {renderCustomItem ? (
          renderCustomItem(label, typeLabel, email, isGroup, status)
        ) : (
          <div
            className={
              isMultiSelect
                ? styles.selectorItemNameMultiSelect
                : styles.selectorItemName
            }
          >
            <Text
              className={classNames(styles.selectorItemLabel, "label-disabled")}
              fontWeight={600}
              fontSize="14px"
              noSelect
              truncate
              dir="auto"
            >
              {label}
              {displayFileExtension && ext ? (
                <span className={styles.itemFileExst}>{ext}</span>
              ) : null}
            </Text>

            {lifetimeTooltip ? (
              <>
                <div
                  data-tooltip-id={`${item.id}_iconTooltip`}
                  className={styles.titleIcon}
                >
                  <LifetimeRoomIcon />
                </div>
                <Tooltip
                  id={`${item.id}_iconTooltip`}
                  place="bottom"
                  getContent={getContent}
                  maxWidth="300px"
                />
              </>
            ) : null}
          </div>
        )}

        {isDisabled && disabledText ? (
          <Text
            className={classNames(
              styles.selectorItemLabel,
              styles.disabledText,
            )}
            fontWeight={600}
            fontSize="13px"
            lineHeight="20px"
            noSelect
          >
            {disabledText}
          </Text>
        ) : disableMultiSelect ? null : isMultiSelect ? (
          <Checkbox
            className={classNames(styles.checkbox, "checkbox")}
            isChecked={isSelected}
            isDisabled={isItemDisabled}
            onChange={onChangeAction}
          />
        ) : null}
      </div>
    );
  };

  return isLoaded ? renderItem() : <div style={style}>{rowLoader}</div>;
}, compareFunction);

Item.displayName = "Item";
export { Item };
