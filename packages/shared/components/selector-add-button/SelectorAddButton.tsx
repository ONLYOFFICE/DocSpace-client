import React from "react";

import ActionsHeaderTouchReactSvgUrl from "PUBLIC_DIR/images/actions.header.touch.react.svg?url";

import { IconButton } from "../icon-button";

import StyledButton from "./SelectorAddButton.styled";
import { SelectorAddButtonProps } from "./SelectorAddButton.types";

const SelectorAddButton = (props: SelectorAddButtonProps) => {
  const {
    isDisabled = false,
    title,
    className,
    id,
    style,
    iconName = ActionsHeaderTouchReactSvgUrl,
    onClick,
  } = props;

  const onClickAction = (e: React.MouseEvent) => {
    if (!isDisabled) onClick?.(e);
  };

  return (
    <StyledButton
      {...props}
      isDisabled={isDisabled}
      title={title}
      onClick={onClickAction}
      className={className}
      id={id}
      style={style}
      data-testid="selector-add-button"
    >
      <IconButton
        size={12}
        iconName={iconName}
        isFill
        isDisabled={isDisabled}
        isClickable={!isDisabled}
      />
    </StyledButton>
  );
};

export { SelectorAddButton };
