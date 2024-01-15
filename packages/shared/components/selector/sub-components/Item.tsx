import React from "react";

import { Avatar, AvatarRole, AvatarSize } from "../../avatar";
import { Text } from "../../text";
import { Checkbox } from "../../checkbox";
import { RoomIcon } from "../../room-icon";

import { StyledItem } from "../Selector.styled";
import { ItemProps, Data, TItem } from "../Selector.types";

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
  const { items, onSelect, isMultiSelect, isItemLoaded, rowLoader }: Data =
    data;

  const isLoaded = isItemLoaded(index);

  const renderItem = () => {
    const item: TItem = items[index];

    if (!item || (item && !item.id))
      return <div style={style}>{rowLoader}</div>;

    const { label, avatar, icon, role, isSelected, isDisabled, color } = item;

    const currentRole = role || AvatarRole.user;

    const defaultIcon = !!color;
    const isLogo = !!icon || defaultIcon;

    const onChangeAction = () => {
      onSelect(item);
    };

    const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (
        ((e.target instanceof HTMLElement || e.target instanceof SVGElement) &&
          !!e.target.closest(".checkbox")) ||
        isDisabled
      )
        return;

      onSelect(item);
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
          />
        ) : defaultIcon ? (
          <RoomIcon color={color} title={label} />
        ) : (
          <img className="room-logo" src={icon} alt="room logo" />
        )}

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
