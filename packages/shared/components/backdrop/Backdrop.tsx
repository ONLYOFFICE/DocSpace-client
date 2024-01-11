import React from "react";
import { isMobile, isTablet } from "../../utils";

import StyledBackdrop from "./Backdrop.styled";
import { BackdropProps } from "./Backdrop.types";

const Backdrop = (props: BackdropProps) => {
  const {
    visible,
    className,
    withBackground = false,
    withoutBlur = false,
    isAside = false,
    withoutBackground = false,
    isModalDialog = false,
  } = props;

  const backdropRef = React.useRef<HTMLDivElement | null>(null);

  const [needBackdrop, setNeedBackdrop] = React.useState(false);
  const [needBackground, setNeedBackground] = React.useState(false);

  const checkingExistBackdrop = React.useCallback(() => {
    if (visible) {
      const tablet = isTablet() || isMobile();
      const backdrops = document.querySelectorAll(".backdrop-active");

      const currentNeedBackdrop =
        backdrops.length < 1 || (isAside && backdrops.length <= 2) || false;

      let currentNeedBackground =
        (currentNeedBackdrop && ((tablet && !withoutBlur) || withBackground)) ||
        false;

      if (isAside && currentNeedBackdrop && !withoutBackground)
        currentNeedBackground = true;

      setNeedBackground(currentNeedBackground);
      setNeedBackdrop(currentNeedBackdrop);
    } else {
      setNeedBackground(false);
      setNeedBackdrop(false);
    }
  }, [visible, isAside, withBackground, withoutBlur, withoutBackground]);

  const modifyClassName = () => {
    const modifiedClass = ["backdrop-active", "not-selectable"];

    if (className) {
      if (typeof className !== "string") {
        className.forEach((c: string) => {
          if (!modifiedClass.includes(c)) {
            modifiedClass.push(c);
          }
        });
      } else {
        modifiedClass.push(className);
      }
    }

    return modifiedClass.join(" ");
  };

  const onTouchHandler = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isModalDialog) e.preventDefault();
    backdropRef.current?.click();
  };

  React.useEffect(() => {
    checkingExistBackdrop();
  }, [checkingExistBackdrop]);

  React.useEffect(() => {
    checkingExistBackdrop();
  }, [checkingExistBackdrop, visible, isAside, withBackground]);

  const modifiedClassName = modifyClassName();

  return visible && (needBackdrop || isAside) ? (
    <StyledBackdrop
      {...props}
      ref={backdropRef}
      className={modifiedClassName}
      needBackground={needBackground}
      visible={visible}
      onTouchMove={onTouchHandler}
      onTouchEnd={onTouchHandler}
      data-testid="backdrop"
    />
  ) : null;
};

Backdrop.defaultProps = {
  visible: false,
  zIndex: 203,
  withBackground: false,
  isAside: false,
  isModalDialog: false,
  withoutBlur: false,
};

export { Backdrop };
