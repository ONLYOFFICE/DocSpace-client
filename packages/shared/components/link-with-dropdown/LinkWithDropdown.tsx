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

import React, { useEffect, useRef, useState } from "react";
import { isMobileOnly } from "react-device-detect";
import { ReactSVG } from "react-svg";

import ExpanderDownReactSvgUrl from "PUBLIC_DIR/images/expander-down.react.svg?url";

import { classNames } from "../../utils";

import { DropDown } from "../drop-down";
import { DropDownItem } from "../drop-down-item";
import { Scrollbar } from "../scrollbar";

import styles from "./LinkWithDropdown.module.scss";
import { Text } from "../text";
import { LinkWithDropDownProps } from "./LinkWithDropdown.types";

const LinkWithDropdown = ({
  isSemitransparent = false,
  dropdownType = "alwaysDashed",
  isTextOverflow = false,
  fontSize = "13px",
  fontWeight,
  color,
  isBold = false,
  title,
  className = "",
  data,
  id,
  style,
  isDisabled = false,
  directionX,
  directionY,
  hasScroll = false,
  withExpander = false,
  dropDownClassName,
  isOpen = false,
  children,
  manualWidth,
  isAside,
  withoutBackground,
  fixedDirection = false,
  isDefaultMode = true,
  ...rest
}: LinkWithDropDownProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [state, setState] = useState({
    isOpen,
    orientation: window.orientation,
  });

  const setIsOpen = (value: boolean) =>
    setState((s) => ({ ...s, isOpen: value }));

  const onSetOrientation = () => {
    setState((s) => ({ ...s, orientation: window.orientation }));
  };

  const onOpen = () => {
    if (isDisabled) return;
    setIsOpen(!state.isOpen);
  };

  const onCheckManualWidth = () => {
    const padding = 32;
    if (ref.current) {
      const width = ref.current
        .querySelector(".text")
        ?.getBoundingClientRect().width;
      if (width) return `${width + padding}px`;
    }
  };

  const onClose = (e: Event) => {
    const target = e.target as HTMLDivElement;
    if (ref.current && ref.current.contains(target)) return;

    setIsOpen(!state.isOpen);
  };

  const onClickDropDownItem = (
    e:
      | React.MouseEvent<Element, MouseEvent>
      | React.ChangeEvent<HTMLInputElement>,
  ) => {
    const currentTarget = e.currentTarget as HTMLElement;
    const { key } = currentTarget.dataset;
    const item = data?.find((x) => x.key === key);
    setIsOpen(!state.isOpen);
    if (item && "onClick" in item) item.onClick?.(e);
  };

  useEffect(() => {
    window.addEventListener("orientationchange", onSetOrientation);

    return () => {
      window.removeEventListener("orientationchange", onSetOrientation);
    };
  }, []);

  useEffect(() => {
    setIsOpen(isOpen);
  }, [dropdownType, isOpen]);

  const showScroll = hasScroll && isMobileOnly;
  const scrollHeight = state.orientation === 90 ? 100 : 250;

  const dropDownItem = data?.map((item) => {
    const { key, ...restProp } = item;
    return (
      <DropDownItem
        key={key}
        {...restProp}
        className={classNames(styles.dropDownItem, "drop-down-item")}
        id={`${item.key}`}
        onClick={onClickDropDownItem}
        testId={`link_with_drop_down_${item.key}`}
        data-key={item.key}
        textOverflow={isTextOverflow}
      />
    );
  });

  const styledText = (
    <Text
      as="span"
      className={classNames(styles.text, {
        [styles.textOverflow]: isTextOverflow,
      })}
      truncate={isTextOverflow}
      fontSize={fontSize}
      fontWeight={fontWeight}
      color={color}
      isBold={isBold}
      title={title}
    >
      {children}
    </Text>
  );

  return (
    <span
      id={id}
      style={style}
      className={classNames(
        styles.span,
        { [styles.isOpen]: state.isOpen },
        className,
      )}
      data-test-id="link-dropdown"
      ref={ref}
    >
      <span onClick={onOpen}>
        <a
          className={classNames(
            styles.linkWithDropdown,
            {
              [styles.disabled]: isDisabled,
              [styles.semitransparent]: isSemitransparent,
              [styles.alwaysDashed]: dropdownType === "alwaysDashed",
              [styles.appearDashedAfterHover]:
                dropdownType === "appearDashedAfterHover",
            },
            className,
          )}
          style={{ color }}
          role="button"
          aria-haspopup="true"
          aria-expanded={state.isOpen}
          aria-disabled={isDisabled}
          {...rest}
        >
          {withExpander ? (
            <div
              className={classNames(
                styles.textWithExpander,
                { [styles.isOpen]: state.isOpen },
                className,
              )}
            >
              {styledText}
              <ReactSVG
                className={styles.expander}
                src={ExpanderDownReactSvgUrl}
              />
            </div>
          ) : (
            styledText
          )}
        </a>
      </span>
      <DropDown
        className={
          classNames(
            "fixed-max-width",
            dropDownClassName || "",
            styles.fixedMaxWidth,
          ) || ""
        }
        manualWidth={
          manualWidth || (showScroll ? onCheckManualWidth() : undefined)
        }
        open={state.isOpen}
        fixedDirection={fixedDirection}
        isDefaultMode={isDefaultMode}
        forwardedRef={ref}
        directionX={directionX}
        directionY={directionY}
        clickOutsideAction={onClose}
        isAside={isAside}
        withoutBackground={withoutBackground}
        {...rest}
      >
        {showScroll ? (
          <Scrollbar
            className="scroll-drop-down-item"
            style={{
              height: scrollHeight,
            }}
          >
            {dropDownItem}
          </Scrollbar>
        ) : (
          dropDownItem
        )}
      </DropDown>
    </span>
  );
};

export { LinkWithDropdown };
