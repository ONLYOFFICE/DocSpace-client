import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { ReactSVG } from "react-svg";
import Text from "../text";
import { GroupMainButton } from "./styled-main-button";
import ContextMenu from "../context-menu";
import { ColorTheme, ThemeType } from "../ColorTheme";

// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/triangle.nav... Remove this comment to see the full error message
import TriangleNavigationDownReactSvgUrl from "PUBLIC_DIR/images/triangle.navigation.down.react.svg?url";

const MainButton = (props: any) => {
  const { text, model, isDropdown, isDisabled, onAction } = props;
  const { id, ...rest } = props;

  const ref = useRef();
  const menuRef = useRef(null);

  const [isOpen, setIsOpen] = useState(props.opened);

  const stopAction = (e: any) => e.preventDefault();

  const toggle = (e: any, isOpen: any) => {
    // @ts-expect-error TS(2531): Object is possibly 'null'.
    isOpen ? menuRef.current.show(e) : menuRef.current.hide(e);

    setIsOpen(isOpen);
  };

  const onHide = () => {
    setIsOpen(false);
  };

  const onMainButtonClick = (e: any) => {
    if (!isDisabled) {
      if (!isDropdown) {
        onAction && onAction(e);
      } else {
        toggle(e, !isOpen);
      }
    } else {
      stopAction(e);
    }
  };

  return (
    <GroupMainButton {...rest} ref={ref}>
      <ColorTheme
        {...rest}
        id={id}
        onClick={onMainButtonClick}
        themeId={ThemeType.MainButton}
      >
        // @ts-expect-error TS(2322): Type '{ children: any; className: string; }' is no... Remove this comment to see the full error message
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
      </ColorTheme>
    </GroupMainButton>
  );
};

MainButton.propTypes = {
  /** Button text */
  text: PropTypes.string,
  /** Sets the button to present a disabled state */
  isDisabled: PropTypes.bool,
  /** Activates a drop-down list for MainButton */
  isDropdown: PropTypes.bool,
  /** Sets a callback function that is triggered when the button is clicked */
  onAction: PropTypes.func,
  /** Opens DropDown */
  opened: PropTypes.bool, //TODO: Make us whole
  /** Accepts class */
  className: PropTypes.string,
  /** Accepts id */
  id: PropTypes.string,
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Data model menu */
  model: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

MainButton.defaultProps = {
  text: "Button",
  isDisabled: false,
  isDropdown: true,
};

export default MainButton;
