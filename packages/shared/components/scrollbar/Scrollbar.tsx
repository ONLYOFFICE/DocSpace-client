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

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "styled-components";
import throttle from "lodash/throttle";

import { classNames, isTouchDevice } from "../../utils";

import StyledScrollbar from "./Scrollbar.styled";
import { ScrollbarProps } from "./Scrollbar.types";
import { Scrollbar } from "./custom-scrollbar";

const ScrollbarComponent = React.forwardRef<Scrollbar, ScrollbarProps>(
  (props, ref) => {
    const {
      onScroll,
      autoHide = true,
      scrollClass,
      fixedSize = false,
      className,
      autoFocus,
      tabIndex = -1,
      ...rest
    } = props;

    const defaultTheme = useTheme();
    const interfaceDirection = defaultTheme?.interfaceDirection;

    const [scrollVisible, setScrollVisible] = useState(false);
    const timerId = useRef<null | ReturnType<typeof setTimeout>>(null);

    const scrollRef = useRef<null | Scrollbar>(null);

    const isRtl = interfaceDirection === "rtl";

    // onScroll handler placed here on Scroller element to get native event instead of parameters that library put
    const renderScroller = React.useCallback(
      (libProps: { elementRef?: React.LegacyRef<HTMLDivElement> }) => {
        const { elementRef, ...restLibProps } = libProps;

        return (
          <div
            {...restLibProps}
            key="scroll-renderer-div"
            className={classNames("scroller", scrollClass || "") || "scroller"}
            ref={elementRef}
            onScroll={onScroll}
          />
        );
      },
      [onScroll, scrollClass],
    );

    const showTracks = useMemo(
      () =>
        throttle(
          () => {
            setScrollVisible(true);

            if (timerId.current) {
              clearTimeout(timerId.current);
            }

            timerId.current = setTimeout(() => setScrollVisible(false), 3000);
          },
          500,
          { trailing: false },
        ),
      [],
    );

    const refSetter = (elementRef: Scrollbar) => {
      if (typeof ref === "function") {
        ref(elementRef);
      } else if (ref) {
        ref.current = elementRef;
      }
      scrollRef.current = elementRef;
    };

    useEffect(() => {
      return () => {
        if (timerId.current) clearTimeout(timerId.current);
      };
    }, []);

    useEffect(() => {
      if (autoFocus) {
        scrollRef.current?.contentElement?.focus();
      }
    }, [autoFocus]);

    const autoHideContainerProps = autoHide
      ? {
          onScroll: showTracks,
          className: classNames(className, {
            "auto-hide": autoHide,
            "scroll-visible": autoHide && scrollVisible,
          }),
        }
      : {};

    const autoHideContentProps =
      autoHide && !isTouchDevice ? { onMouseMove: showTracks } : {};
    const tabIndexProp = tabIndex !== null ? { tabIndex } : {};

    return (
      <StyledScrollbar
        {...rest}
        data-testid="scrollbar"
        disableTracksWidthCompensation
        $fixedSize={fixedSize}
        rtl={isRtl}
        className={className}
        wrapperProps={{ className: "scroll-wrapper" }}
        scrollerProps={{ renderer: renderScroller }}
        contentProps={{
          className: "scroll-body",
          ...tabIndexProp,
          ...autoHideContentProps,
        }}
        thumbYProps={{ className: "thumb thumb-vertical" }}
        thumbXProps={{ className: "thumb thumb-horizontal" }}
        trackYProps={{ className: "track track-vertical" }}
        trackXProps={{ className: "track track-horizontal" }}
        ref={refSetter}
        {...autoHideContainerProps}
      />
    );
  },
);

ScrollbarComponent.displayName = "Scrollbar";

export { ScrollbarComponent };
