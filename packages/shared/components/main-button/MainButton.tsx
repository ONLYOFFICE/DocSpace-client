import React, { useRef, useState } from "react";
import { ReactSVG } from "react-svg";

import TriangleNavigationDownReactSvgUrl from "PUBLIC_DIR/images/triangle.navigation.down.react.svg?url";

import { Text } from "../text";
import { ContextMenu } from "../context-menu";

import { GroupMainButton } from "./MainButton.styled";
import { MainButtonProps } from "./MainButton.types";
import MainButtonTheme from "./MainButton.theme";

const MainButton = (props: MainButtonProps) => {
  const { text, model, isDropdown, isDisabled, onAction, opened } = props;
  const { id, ...rest } = props;

  const ref = useRef(null);
  const menuRef = useRef<null | {
    show: (e: React.MouseEvent) => void;
    hide: (e: React.MouseEvent) => void;
  }>(null);

  const [isOpen, setIsOpen] = useState(opened);

  const stopAction = (e: React.MouseEvent) => e.preventDefault();

  const toggle = (e: React.MouseEvent, isOpenProp: boolean) => {
    if (!menuRef.current) return;

    const menu = menuRef.current;

    if (isOpenProp) {
      menu.show(e);
    } else {
      menu.hide(e);
    }

    setIsOpen(isOpenProp);
  };

  const onHide = () => {
    setIsOpen(false);
  };

  const onMainButtonClick = (e: React.MouseEvent) => {
    if (!isDisabled) {
      if (!isDropdown) {
        onAction?.(e);
      } else {
        toggle(e, !isOpen);
      }
    } else {
      stopAction(e);
    }
  };

  return (
    <GroupMainButton {...rest} ref={ref} data-testid="main-button">
      <MainButtonTheme {...rest} id={id} onClick={onMainButtonClick}>
        <Text className="main-button_text">{text}</Text>
        {isDropdown && (
          <>
            <ReactSVG
              className="main-button_img"
              src={TriangleNavigationDownReactSvgUrl}
            />

            <ContextMenu
              model={model}
              containerRef={ref}
              ref={menuRef}
              onHide={onHide}
            />
          </>
        )}
      </MainButtonTheme>
    </GroupMainButton>
  );
};

MainButton.defaultProps = {
  text: "Button",
  isDisabled: false,
  isDropdown: true,
};

export { MainButton };
