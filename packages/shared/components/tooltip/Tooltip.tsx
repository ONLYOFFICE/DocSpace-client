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
import { flip, shift, offset } from "@floating-ui/dom";
import { Tooltip as ReactTooltip, TooltipRefProps } from "react-tooltip";

import { Portal } from "../portal";

import StyledTooltip from "./Tooltip.styled";
import {
  TooltipProps,
  TFallbackAxisSideDirection,
  TTooltipPlace,
} from "./Tooltip.types";
import { DEFAULT_OFFSET } from "./Tooltip.constants";

export type { TFallbackAxisSideDirection, TTooltipPlace };

const globalCloseEvents = {
  escape: true,
  resize: true,
  scroll: true,
  clickOutsideAnchor: true,
};

const Tooltip = React.forwardRef<TooltipRefProps, TooltipProps>(
  (
    {
      id,
      place = "top",
      getContent,
      children,
      afterShow,
      afterHide,
      className,
      style,
      color,
      maxWidth,
      anchorSelect,
      clickable,
      openOnClick,
      isOpen,
      float,
      noArrow = true,
      fallbackAxisSideDirection,
      opacity,
      imperativeModeOnly,
      ...rest
    },
    ref,
  ) => {
    const openEvents = {
      click: openOnClick,
      mouseenter: !openOnClick,
    };

    const closeEvents = {
      click: openOnClick,
      mouseleave: !openOnClick,
    };

    const renderTooltip = () => (
      <StyledTooltip
        className={className}
        style={style}
        color={color}
        maxWidthProp={maxWidth}
        data-testid="tooltip"
      >
        <ReactTooltip
          ref={ref}
          id={id}
          opacity={opacity}
          float={float}
          place={place}
          isOpen={isOpen}
          noArrow={noArrow}
          render={getContent}
          clickable={clickable}
          afterShow={afterShow}
          afterHide={afterHide}
          openEvents={openEvents}
          positionStrategy="fixed"
          closeEvents={closeEvents}
          openOnClick={openOnClick}
          anchorSelect={anchorSelect}
          imperativeModeOnly={imperativeModeOnly}
          className="__react_component_tooltip"
          globalCloseEvents={globalCloseEvents}
          middlewares={[
            offset(rest.offset ?? DEFAULT_OFFSET),
            flip({
              crossAxis: false,
              fallbackAxisSideDirection,
            }),
            shift(),
          ]}
          {...rest}
        >
          {children}
        </ReactTooltip>
      </StyledTooltip>
    );

    const tooltip = renderTooltip();

    return <Portal element={tooltip} />;
  },
);

Tooltip.displayName = "Tooltip";

export { Tooltip };
