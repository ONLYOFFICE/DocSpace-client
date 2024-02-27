import React from "react";

import { Avatar, AvatarRole, AvatarSize } from "../../avatar";
import { Text } from "../../text";
import { Checkbox } from "../../checkbox";

import { StyledSelectAll } from "../Selector.styled";
import { SelectAllProps } from "../Selector.types";

const SelectAll = React.memo(
  ({
    label,
    icon,
    onSelectAll,
    isChecked,
    isIndeterminate,
    isLoading,
    rowLoader,
  }: SelectAllProps) => {
    const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target instanceof HTMLElement && e.target.closest(".checkbox"))
        return;

      onSelectAll();
    };

    return (
      <StyledSelectAll onClick={onClick}>
        {isLoading ? (
          rowLoader
        ) : (
          <>
            <Avatar
              className="select-all_avatar"
              source={icon}
              role={AvatarRole.user}
              size={AvatarSize.min}
            />

            <Text
              className="label"
              fontWeight={600}
              fontSize="14px"
              noSelect
              truncate
            >
              {label}
            </Text>

            <Checkbox
              className="checkbox"
              isChecked={isChecked}
              isIndeterminate={isIndeterminate}
              // onChange={onSelectAll}
            />
          </>
        )}
      </StyledSelectAll>
    );
  },
);

SelectAll.displayName = "SelectAll";

export { SelectAll };
