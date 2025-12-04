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

import React, { forwardRef } from "react";
import {
  TTooltipPlace,
  WithTooltipProps,
  MouseEventHandler,
} from "../Tooltip.types";
import { useTooltipControl } from "../hooks/useTooltipControl";

export const createTooltipWrapper = <TProps extends object>(
  Component: React.ComponentType<TProps>,
) => {
  type PropsWithHandlers = TProps &
    WithTooltipProps & {
      onClick?: MouseEventHandler;
      onMouseEnter?: MouseEventHandler;
      onMouseLeave?: MouseEventHandler;
    };

  const ComponentWithTooltip = forwardRef<HTMLElement, PropsWithHandlers>(
    (props, ref) => {
      const {
        title,
        tooltipContent,
        tooltipPlace,
        tooltipFitToContent,
        onClick,
        onMouseEnter,
        onMouseLeave,
        ...componentProps
      } = props;

      const content = tooltipContent || title;
      const contentString = typeof content === "string" ? content : undefined;

      const tooltipHandlers = useTooltipControl(
        onClick,
        onMouseEnter,
        onMouseLeave,
        contentString,
        tooltipPlace as TTooltipPlace,
      );

      const isTestEnvironment = process.env.NODE_ENV === "test";

      if (isTestEnvironment && contentString) {
        return (
          <Component
            ref={ref}
            {...(componentProps as TProps)}
            title={contentString}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          />
        );
      }

      if (!contentString) {
        return (
          <Component
            ref={ref}
            {...(componentProps as TProps)}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          />
        );
      }

      const element = (
        <Component
          ref={ref}
          {...(componentProps as TProps)}
          data-tooltip-anchor={tooltipHandlers.anchorId}
          onMouseEnter={tooltipHandlers.handleMouseEnter}
          onMouseLeave={tooltipHandlers.handleMouseLeave}
          onClick={tooltipHandlers.handleClick}
        />
      );

      return tooltipFitToContent ? (
        <span
          data-tooltip-anchor={tooltipHandlers.anchorId}
          style={{ display: "inline-block", width: "fit-content" }}
        >
          {element}
        </span>
      ) : (
        element
      );
    },
  );

  ComponentWithTooltip.displayName = `withTooltip(${
    Component.displayName || Component.name || "Component"
  })`;

  return ComponentWithTooltip;
};
