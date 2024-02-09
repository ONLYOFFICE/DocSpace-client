import React from "react";
import { useTranslation } from "react-i18next";
import { getUserTypeLabel } from "../../../utils/common";
import { Avatar, AvatarRole, AvatarSize } from "../../avatar";
import { Text } from "../../text";
import { Checkbox } from "../../checkbox";
import { RoomIcon } from "../../room-icon";

import { StyledItem } from "../Selector.styled";
import { ItemProps, Data, TSelectorItem } from "../Selector.types";

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
    prevItem?.isSelected === nextItem?.isSelected
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
  }: Data = data;
  const { t } = useTranslation(["Common"]);

  const isLoaded = isItemLoaded(index);

  const renderItem = () => {
    const item: TSelectorItem = items[index];

    if (!item || (item && !item.id))
      return <div style={style}>{rowLoader}</div>;

    const {
      label,
      avatar,
      icon,
      role,
      isSelected,
      isDisabled,
      color,
      email,
      isGroup,
    } = item;

    const currentRole = role || AvatarRole.user;

    const typeLabel = getUserTypeLabel(role, t);

    const defaultIcon = !!color;
    const isLogo = !!icon || defaultIcon;

    const onChangeAction = () => {
      onSelect?.(item);
    };

    const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (
        ((e.target instanceof HTMLElement || e.target instanceof SVGElement) &&
          !!e.target.closest(".checkbox")) ||
        isDisabled
      )
        return;

      onSelect?.(item);
    };

    return (
      <StyledItem
        isSelected={isSelected}
        isMultiSelect={isMultiSelect}
        style={style}
        onClick={onClick}
        className="test-22"
        isDisabled={isDisabled}
      >
        {!isLogo ? (
          <Avatar
            className="user-avatar"
            source={avatar || ""}
            role={currentRole}
            size={AvatarSize.min}
            isGroup={isGroup}
            userName={isGroup ? label : ""}
          />
        ) : (
          <RoomIcon
            color={color}
            title={label}
            showDefault={defaultIcon}
            imgClassName="room-logo"
            imgSrc={icon}
          />
        )}
        {renderCustomItem ? (
          renderCustomItem(label, typeLabel, email, isGroup)
        ) : (
          <Text
            className="label"
            fontWeight={600}
            fontSize="14px"
            noSelect
            truncate
            dir="auto"
          >
            {label}
          </Text>
        )}

        {isMultiSelect && (
          <Checkbox
            className="checkbox"
            isChecked={isSelected}
            onChange={onChangeAction}
          />
        )}
      </StyledItem>
    );
  };

  return isLoaded ? renderItem() : <div style={style}>{rowLoader}</div>;
}, compareFunction);

Item.displayName = "Item";
export { Item };
