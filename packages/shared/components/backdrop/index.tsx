// (c) Copyright Ascensio System SIA 2009-2024
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

import { isMobile, isTablet } from "../../utils";

import StyledBackdrop from "./Backdrop.styled";
import { BackdropProps } from "./Backdrop.types";

const Backdrop: React.FC<BackdropProps> = ({
  visible = false,
  className,
  withBackground = false,
  withoutBlur = false,
  isAside = false,
  withoutBackground = false,
  isModalDialog = false,
  zIndex = 203,
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
      backdropCount < 1 || (isAside && backdropCount <= 2);

    // Determine if background is needed
    const shouldShowBackground =
      shouldShowBackdrop &&
      ((isTabletOrMobile && !withoutBlur) ||
        withBackground ||
        (isAside && !withoutBackground));

    setNeedBackdrop(shouldShowBackdrop);
    setNeedBackground(shouldShowBackground);
  }, [visible, isAside, withBackground, withoutBlur, withoutBackground]);

  const getComposedClassName = React.useCallback((): string => {
    const baseClasses = new Set(["backdrop-active", "not-selectable"]);

    if (typeof className === "string") {
      baseClasses.add(className);
    } else if (Array.isArray(className)) {
      className.forEach((cls) => baseClasses.add(cls));
    }

    return Array.from(baseClasses).join(" ");
  }, [className]);

  const handleTouch = React.useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!isModalDialog) {
        e.preventDefault();
      }
      backdropRef.current?.click();
    },
    [isModalDialog],
  );

  // Single effect to handle backdrop state updates
  React.useEffect(() => {
    updateBackdropState();
  }, [updateBackdropState]);

  if (!visible || (!needBackdrop && !isAside)) {
    return null;
  }

  return (
    <StyledBackdrop
      {...restProps}
      ref={backdropRef}
      zIndex={zIndex}
      className={getComposedClassName()}
      needBackground={needBackground}
      visible={visible}
      onTouchMove={handleTouch}
      onTouchEnd={handleTouch}
      data-testid="backdrop"
    />
  );
};

export { Backdrop };
