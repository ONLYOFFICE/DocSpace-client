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

import React, {
  ComponentType,
  ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
import { Tooltip } from "./index";
import type { TTooltipPlace } from "./Tooltip.types";
import { DEFAULT_DELAY_SHOW } from "./Tooltip.constants";
import type { TooltipRefProps } from "react-tooltip";

interface WithTooltipProps {
  title?: string;
  tooltipContent?: ReactNode;
  tooltipId?: string;
  tooltipPlace?: TTooltipPlace;
  tooltipFitToContent?: boolean;
}

function useTooltipHandlers(
  originalOnClick?: (e: React.MouseEvent) => void,
  originalOnMouseEnter?: (e: React.MouseEvent) => void,
  originalOnMouseLeave?: (e: React.MouseEvent) => void,
) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, DEFAULT_DELAY_SHOW);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(false);
  }, []);

  const handleMouseEnterCombined = useCallback(
    (e: React.MouseEvent) => {
      handleMouseEnter();
      if (originalOnMouseEnter) {
        originalOnMouseEnter(e);
      }
    },
    [originalOnMouseEnter],
  );

  const handleMouseLeaveCombined = useCallback(
    (e: React.MouseEvent) => {
      handleMouseLeave();
      if (originalOnMouseLeave) {
        originalOnMouseLeave(e);
      }
    },
    [originalOnMouseLeave],
  );

  const handleClickOrMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsOpen(false);
      if (originalOnClick) {
        originalOnClick(e);
      }
    },
    [originalOnClick],
  );

  return {
    isOpen,
    handleMouseEnterCombined,
    handleMouseLeaveCombined,
    handleClickOrMouseDown,
  };
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
      onClick: originalOnClick,
      onMouseEnter: originalOnMouseEnter,
      onMouseLeave: originalOnMouseLeave,
      ...restProps
    } = props as T &
      WithTooltipProps & {
        onClick?: (e: React.MouseEvent) => void;
        onMouseEnter?: (e: React.MouseEvent) => void;
        onMouseLeave?: (e: React.MouseEvent) => void;
      };

    if (title || tooltipContent) {
      const uniqueId =
        tooltipId || `tooltip-${Math.random().toString(36).substring(2, 11)}`;
      const content: ReactNode = tooltipContent || title;
      const tooltipRef = useRef<TooltipRefProps>(null);

      const {
        isOpen,
        handleMouseEnterCombined,
        handleMouseLeaveCombined,
        handleClickOrMouseDown,
      } = useTooltipHandlers(
        originalOnClick,
        originalOnMouseEnter,
        originalOnMouseLeave,
      );

      if (tooltipFitToContent) {
        return (
          <>
            <span
              data-tooltip-id={uniqueId}
              data-tip=""
              style={{ display: "inline-block", width: "fit-content" }}
              onMouseEnter={handleMouseEnterCombined}
              onMouseLeave={handleMouseLeaveCombined}
              onClick={handleClickOrMouseDown}
              onMouseDown={handleClickOrMouseDown}
            >
              <WrappedComponent {...(restProps as T)} ref={ref} />
            </span>
            <Tooltip
              ref={tooltipRef}
              id={uniqueId}
              place={tooltipPlace}
              getContent={() => content}
              isOpen={isOpen}
              openOnClick={false}
              imperativeModeOnly
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
            onMouseEnter={handleMouseEnterCombined}
            onMouseLeave={handleMouseLeaveCombined}
            onClick={handleClickOrMouseDown}
            onMouseDown={handleClickOrMouseDown}
          />
          <Tooltip
            ref={tooltipRef}
            id={uniqueId}
            place={tooltipPlace}
            getContent={() => content}
            isOpen={isOpen}
            openOnClick={false}
            imperativeModeOnly
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
      onClick: originalOnClick,
      onMouseEnter: originalOnMouseEnter,
      onMouseLeave: originalOnMouseLeave,
      ...restProps
    } = props as React.ComponentPropsWithoutRef<T> &
      WithTooltipProps & {
        onClick?: (e: React.MouseEvent<Element>) => void;
        onMouseEnter?: (e: React.MouseEvent<Element>) => void;
        onMouseLeave?: (e: React.MouseEvent<Element>) => void;
      };

    if (title || tooltipContent) {
      const uniqueId =
        tooltipId || `tooltip-${Math.random().toString(36).substring(2, 11)}`;
      const content: ReactNode = tooltipContent || title;
      const tooltipRef = useRef<TooltipRefProps>(null);

      const {
        isOpen,
        handleMouseEnterCombined,
        handleMouseLeaveCombined,
        handleClickOrMouseDown,
      } = useTooltipHandlers(
        originalOnClick,
        originalOnMouseEnter,
        originalOnMouseLeave,
      );

      if (tooltipFitToContent) {
        return (
          <>
            <span
              data-tooltip-id={uniqueId}
              data-tip=""
              style={{ display: "inline-block", width: "fit-content" }}
              onMouseEnter={handleMouseEnterCombined}
              onMouseLeave={handleMouseLeaveCombined}
              onClick={handleClickOrMouseDown}
              onMouseDown={handleClickOrMouseDown}
            >
              {React.createElement<React.ComponentPropsWithoutRef<T>>(Element, {
                ...(restProps as React.ComponentPropsWithoutRef<T>),
                ref,
              })}
            </span>
            <Tooltip
              ref={tooltipRef}
              id={uniqueId}
              place={tooltipPlace}
              getContent={() => content}
              isOpen={isOpen}
              openOnClick={false}
              imperativeModeOnly
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
            onMouseEnter: handleMouseEnterCombined,
            onMouseLeave: handleMouseLeaveCombined,
            onClick: handleClickOrMouseDown,
            onMouseDown: handleClickOrMouseDown,
          })}
          <Tooltip
            ref={tooltipRef}
            id={uniqueId}
            place={tooltipPlace}
            getContent={() => content}
            isOpen={isOpen}
            openOnClick={false}
            imperativeModeOnly
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
