import React, { useState, useEffect, useCallback } from "react";

import { DropDownItem } from "../drop-down-item";
import { Badge } from "../badge";
import { TOption } from "../combobox";

import {
  StyledItemTitle,
  StyledItemContent,
  StyledItemIcon,
  StyledItemDescription,
  StyledItem,
  StyledWrapper,
} from "./AccessRightSelect.styled";
import { AccessRightSelectProps } from "./AccessRightSelect.types";

export const AccessRightSelectPure = ({
  accessOptions,
  onSelect,
  advancedOptions,
  selectedOption,
  className,
  ...props
}: AccessRightSelectProps) => {
  const [currentItem, setCurrentItem] = useState(selectedOption);

  useEffect(() => {
    setCurrentItem(selectedOption);
  }, [selectedOption]);

  const onSelectCurrentItem = useCallback(
    (option: TOption) => {
      if (option) {
        setCurrentItem(option);
        onSelect?.(option);
      }
    },
    [onSelect],
  );

  const formatToAccessRightItem = (data: TOption[]) => {
    const items = data.map((item: TOption) => {
      return "isSeparator" in item && item.isSeparator ? (
        <DropDownItem key={item.key} isSeparator />
      ) : (
        <DropDownItem
          className="access-right-item"
          key={item.key}
          data-key={item.key}
          onClick={() => onSelectCurrentItem(item)}
        >
          <StyledItem>
            {item.icon && <StyledItemIcon src={item.icon} />}
            <StyledItemContent>
              <StyledItemTitle>
                {item.label}
                {item.quota && (
                  <Badge
                    label={item.quota}
                    backgroundColor={item.color}
                    fontSize="9px"
                    isPaidBadge
                  />
                )}
              </StyledItemTitle>
              <StyledItemDescription>{item.description}</StyledItemDescription>
            </StyledItemContent>
          </StyledItem>
        </DropDownItem>
      );
    });

    return items;
  };

  const formattedOptions =
    advancedOptions || formatToAccessRightItem(accessOptions);

  // console.log(formattedOptions);

  return (
    <StyledWrapper
      className={className}
      advancedOptions={formattedOptions}
      onSelect={onSelectCurrentItem}
      options={[]}
      selectedOption={{
        icon: currentItem?.icon,
        default: true,
        key: currentItem?.key,
        label: currentItem?.label,
      }}
      forceCloseClickOutside
      {...props}
    />
  );
};

const AccessRightSelect = React.memo(AccessRightSelectPure);

export { AccessRightSelect };
