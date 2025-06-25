// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import classNames from "classnames";

import { isMobile, isTablet } from "../../utils";
import { BackdropProps } from "./Backdrop.types";

import styles from "./Backdrop.module.scss";

const Backdrop: React.FC<BackdropProps> = ({
  visible = false,
  className,
  withBackground = false,
  withoutBlur = false,
  isAside = false,
  withoutBackground = false,
  isModalDialog = false,
  zIndex = 203,
  onClick,
  shouldShowBackdrop: shouldShowBackdropProp = false,
  ...restProps
}) => {
  const backdropRef = React.useRef<HTMLDivElement | null>(null);
  const [needBackdrop, setNeedBackdrop] = React.useState(false);
  const [needBackground, setNeedBackground] = React.useState(false);

  const updateBackdropState = React.useCallback(() => {
    if (!visible) {
      setNeedBackground(false);
      setNeedBackdrop(false);
      return;
    }

    const isTabletOrMobile = isTablet() || isMobile();
    const existingBackdrops = document.querySelectorAll(".backdrop-active");
    const backdropCount = existingBackdrops.length;

    // Determine if backdrop is needed
    const shouldShowBackdrop =
      backdropCount < 1 ||
      (isAside && backdropCount <= 2) ||
      shouldShowBackdropProp;

    // Determine if background is needed
    const shouldShowBackground =
      !withoutBackground &&
      (withBackground ||
        (isTabletOrMobile && !withoutBlur) ||
        (isAside && !withoutBackground));

    setNeedBackdrop(shouldShowBackdrop);
    setNeedBackground(shouldShowBackground);
  }, [
    visible,
    isAside,
    withBackground,
    withoutBlur,
    withoutBackground,
    shouldShowBackdropProp,
  ]);

  const backdropClasses = classNames(
    styles.backdrop,
    "backdrop-active",
    "not-selectable",
    Array.isArray(className) ? className : className?.split(" "),
    {
      [styles.visible]: visible,
      [styles.withBackground]: needBackground,
      [styles.withoutBackground]: !needBackground || withoutBackground,
      [styles.withoutBlur]: withoutBlur,
      [styles.withBlur]: !withoutBlur,
      [styles.isAside]: isAside,
      [styles.isModalDialog]: isModalDialog,
      [styles.mobileView]: isMobile() || isTablet(),
    },
  );

  const handleTouch = React.useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!isModalDialog) {
        e.preventDefault();
      }

      onClick?.(e as unknown as React.MouseEvent);
    },
    [isModalDialog, onClick],
  );

  React.useEffect(() => {
    updateBackdropState();
  }, [updateBackdropState]);

  if (!visible || (!needBackdrop && !isAside)) {
    return null;
  }

  return (
    <div
      {...restProps}
      ref={backdropRef}
      className={backdropClasses}
      style={{ zIndex, ...restProps.style }}
      onClick={onClick}
      onTouchMove={handleTouch}
      onTouchEnd={handleTouch}
      data-testid="backdrop"
    />
  );
};

export { Backdrop };
