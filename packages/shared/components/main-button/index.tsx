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

import React, { useRef, useEffect, useState } from "react";
import { ReactSVG } from "react-svg";
import classNames from "classnames";
import TriangleNavigationDownReactSvgUrl from "PUBLIC_DIR/images/triangle.navigation.down.react.svg?url";
import { GuidanceRefKey } from "../guidance/sub-components/Guid.types";
import { Text } from "../text";
import { ContextMenu } from "../context-menu";
import { MainButtonProps } from "./MainButton.types";
import styles from "./MainButton.module.scss";
import { ContextMenuRefType } from "../context-menu/ContextMenu.types";

const MainButton = (props: MainButtonProps) => {
  const {
    model,
    onAction,
    text = "Button",
    isDropdown = true,
    isDisabled = false,
    className,
    id,
    setRefMap,
    ...rest
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<ContextMenuRefType>(null);
  const [buttonWidth, setButtonWidth] = useState<number | null>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setButtonWidth(rect.width);
        if (setRefMap) {
          setRefMap(GuidanceRefKey.MainButton, buttonRef);
        }
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [setRefMap]);

  const onMainButtonClick = (e: React.MouseEvent) => {
    if (!isDisabled) {
      if (!isDropdown) {
        onAction?.(e);
      } else if (menuRef.current && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const newEvent = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: rect.left,
          clientY: rect.bottom,
        });
        Object.defineProperty(newEvent, "pageX", { value: rect.left });
        Object.defineProperty(newEvent, "pageY", { value: rect.bottom });

        setButtonWidth(rect.width);
        menuRef.current.toggle(newEvent);
      }
    } else {
      e.preventDefault();
    }
  };

  const buttonClasses = classNames(styles.mainButton, className, {
    [styles.disabled]: isDisabled,
    [styles.dropdown]: isDropdown,
  });

  return (
    <div
      className={styles.groupMainButton}
      ref={containerRef}
      data-testid="main-button"
    >
      <div
        {...rest}
        id={id}
        ref={buttonRef}
        className={buttonClasses}
        onClick={onMainButtonClick}
      >
        <Text className={styles.text}>{text}</Text>
        {isDropdown ? (
          <>
            <ReactSVG
              className={styles.img}
              src={TriangleNavigationDownReactSvgUrl}
            />
            <ContextMenu
              className={styles.menu}
              model={model}
              ref={menuRef}
              appendTo={document.body}
              containerRef={buttonRef}
              style={{
                position: "fixed",
                width: buttonWidth ? `${buttonWidth}px` : "auto",
              }}
            />
          </>
        ) : null}
      </div>
    </div>
  );
};

export { MainButton };
