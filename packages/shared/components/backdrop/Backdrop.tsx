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

const Backdrop = (props: BackdropProps) => {
  const {
    visible = false,
    className,
    withBackground = false,
    withoutBlur = false,
    isAside = false,
    withoutBackground = false,
    isModalDialog = false,

    zIndex = 203,
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
      zIndex={zIndex}
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

export { Backdrop };
