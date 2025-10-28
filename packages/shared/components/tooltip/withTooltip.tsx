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

import React, { ComponentType, ReactNode } from "react";
import { Tooltip } from "./index";
import type { TTooltipPlace } from "./Tooltip.types";
import { DEFAULT_DELAY_SHOW } from "./Tooltip.constants";

interface WithTooltipProps {
  title?: string;
  tooltipContent?: ReactNode;
  tooltipId?: string;
  tooltipPlace?: TTooltipPlace;
  tooltipFitToContent?: boolean;
}

export function withTooltip<T extends object>(
  WrappedComponent: ComponentType<T>,
) {
  return React.forwardRef<unknown, T & WithTooltipProps>((props, ref) => {
    const {
      title,
      tooltipContent,
      tooltipId,
      tooltipPlace = "bottom" as TTooltipPlace,
      tooltipFitToContent = false,
      ...restProps
    } = props;

    if (title || tooltipContent) {
      const uniqueId =
        tooltipId || `tooltip-${Math.random().toString(36).substring(2, 11)}`;
      const content: ReactNode = tooltipContent || title;

      if (tooltipFitToContent) {
        return (
          <>
            <span
              data-tooltip-id={uniqueId}
              data-tip=""
              style={{ display: "inline-block", width: "fit-content" }}
            >
              <WrappedComponent {...(restProps as T)} ref={ref} />
            </span>
            <Tooltip
              id={uniqueId}
              place={tooltipPlace}
              getContent={() => content}
              delayShow={DEFAULT_DELAY_SHOW}
            />
          </>
        );
      }

      return (
        <>
          <WrappedComponent
            {...(restProps as T)}
            ref={ref}
            data-tooltip-id={uniqueId}
            data-tip=""
          />
          <Tooltip
            id={uniqueId}
            place={tooltipPlace}
            getContent={() => content}
            delayShow={DEFAULT_DELAY_SHOW}
          />
        </>
      );
    }

    return <WrappedComponent {...(restProps as T)} ref={ref} />;
  });
}

export function withTooltipForElement<
  T extends keyof React.JSX.IntrinsicElements = "div",
>(Element: T = "div" as T) {
  return React.forwardRef<
    React.ComponentRef<T>,
    React.ComponentPropsWithoutRef<T> & WithTooltipProps
  >((props, ref) => {
    const {
      title,
      tooltipContent,
      tooltipId,
      tooltipPlace = "bottom" as TTooltipPlace,
      tooltipFitToContent = false,
      ...restProps
    } = props;

    if (title || tooltipContent) {
      const uniqueId =
        tooltipId || `tooltip-${Math.random().toString(36).substring(2, 11)}`;
      const content: ReactNode = tooltipContent || title;

      if (tooltipFitToContent) {
        return (
          <>
            <span
              data-tooltip-id={uniqueId}
              data-tip=""
              style={{ display: "inline-block", width: "fit-content" }}
            >
              {React.createElement<React.ComponentPropsWithoutRef<T>>(Element, {
                ...(restProps as React.ComponentPropsWithoutRef<T>),
                ref,
              })}
            </span>
            <Tooltip
              id={uniqueId}
              place={tooltipPlace}
              getContent={() => content}
              delayShow={DEFAULT_DELAY_SHOW}
            />
          </>
        );
      }

      return (
        <>
          {React.createElement<React.ComponentPropsWithoutRef<T>>(Element, {
            ...(restProps as React.ComponentPropsWithoutRef<T>),
            ref,
            "data-tooltip-id": uniqueId,
            "data-tip": "",
          })}
          <Tooltip
            id={uniqueId}
            place={tooltipPlace}
            getContent={() => content}
            delayShow={DEFAULT_DELAY_SHOW}
          />
        </>
      );
    }

    return React.createElement<React.ComponentPropsWithoutRef<T>>(Element, {
      ...(restProps as React.ComponentPropsWithoutRef<T>),
      ref,
    });
  });
}
