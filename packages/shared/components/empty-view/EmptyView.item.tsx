import React from "react";
import ArrowIcon from "PUBLIC_DIR/images/icons/12/arrow.right.svg";

import { Text } from "../text";
import { ContextMenu, ContextMenuRefType } from "../context-menu";

import { EmptyViewItemBody, EmptyViewItemWrapper } from "./EmptyView.styled";
import type { EmptyViewItemProps } from "./EmptyView.types";

export const EmptyViewItem = ({
  description,
  icon,
  title,
  onClick,
  disabled,
  model,
}: EmptyViewItemProps) => {
  const contexRef = React.useRef<ContextMenuRefType>(null);

  if (disabled) return;

  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!model) return onClick?.(event);

    contexRef.current?.show(event);
  };

  return (
    <EmptyViewItemWrapper
      onClick={handleClick}
      role="button"
      aria-label={title}
    >
      <ContextMenu ref={contexRef} model={model ?? []} />
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
