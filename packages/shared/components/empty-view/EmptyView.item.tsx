import React from "react";
import ArrowIcon from "PUBLIC_DIR/images/icons/12/arrow.right.svg";

import { Text } from "../text";

import { EmptyViewItemBody, EmptyViewItemWrapper } from "./EmptyView.styled";
import type { EmptyViewItemProps } from "./EmptyView.types";

export const EmptyViewItem = ({
  description,
  icon,
  title,
  onClick,
  disabled,
}: EmptyViewItemProps) => {
  if (disabled) return;

  return (
    <EmptyViewItemWrapper onClick={onClick}>
      {React.cloneElement(icon, { className: "ev-item__icon" })}
      <EmptyViewItemBody>
        <Text
          as="h4"
          fontWeight="600"
          lineHeight="20px"
          className="ev-item-header"
          noSelect
        >
          {title}
        </Text>
        <Text as="p" fontSize="12px" className="ev-item-subheading" noSelect>
          {description}
        </Text>
      </EmptyViewItemBody>
      <ArrowIcon className="ev-item__arrow-icon" />
    </EmptyViewItemWrapper>
  );
};
