import React from "react";
import CrossReactSvgUrl from "PUBLIC_DIR/images/cross.react.svg?url";

import { IconButton } from "../icon-button";

import { SelectedItemProps } from "./SelectedItem.types";
import { StyledSelectedItem, StyledLabel } from "./SelectedItem.styled";

export const SelectedItemPure = (props: SelectedItemProps) => {
  const {
    label,
    onClose,
    isDisabled = false,
    onClick,
    isInline = true,
    className,
    id,
    propKey,
    group,
    forwardedRef,
    classNameCloseButton,
  } = props;
  if (!label) return null;

  const onCloseClick = (e: React.MouseEvent) => {
    if (!isDisabled) onClose(propKey, label, group || "", e);
  };

  const handleOnClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;

    if (!isDisabled && !target.classList.contains("selected-tag-removed"))
      onClick?.(propKey, label, group, e);
  };

  return (
    <StyledSelectedItem
      onClick={handleOnClick}
      isInline={isInline}
      className={className}
      isDisabled={isDisabled}
      id={id}
      ref={forwardedRef}
      data-testid="selected-item"
    >
      <StyledLabel
        className="selected-item_label"
        truncate
        isDisabled={isDisabled}
      >
        {label}
      </StyledLabel>
      <IconButton
        className={`selected-tag-removed ${classNameCloseButton}`}
        iconName={CrossReactSvgUrl}
        size={12}
        onClick={onCloseClick}
        isFill
        isDisabled={isDisabled}
      />
    </StyledSelectedItem>
  );
};

const SelectedItem = React.memo(SelectedItemPure);

export { SelectedItem };
