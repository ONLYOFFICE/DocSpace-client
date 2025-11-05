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
  useEffect,
} from "react";
import type { TTooltipPlace } from "./Tooltip.types";
import { DEFAULT_DELAY_SHOW } from "./Tooltip.constants";
import type { TooltipRefProps } from "react-tooltip";

declare global {
  interface Window {
    __systemTooltipRef?: React.RefObject<TooltipRefProps | null>;
  }
}

interface WithTooltipProps {
  title?: string;
  tooltipContent?: ReactNode;
  tooltipPlace?: TTooltipPlace;
  tooltipFitToContent?: boolean;
}

function useTooltipControl(
  originalOnClick?: (e: React.MouseEvent) => void,
  originalOnMouseEnter?: (e: React.MouseEvent) => void,
  originalOnMouseLeave?: (e: React.MouseEvent) => void,
  contentString?: string,
  tooltipPlace: TTooltipPlace = "bottom",
) {
  const [isReady, setIsReady] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);
  const anchorId = useRef<string>(
    `tooltip-${Math.floor(Math.random() * 1000000)}`,
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setIsReady(true);
      }, DEFAULT_DELAY_SHOW);

      if (originalOnMouseEnter) {
        originalOnMouseEnter(e);
      }
    },
    [originalOnMouseEnter],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsReady(false);

      if (originalOnMouseLeave) {
        originalOnMouseLeave(e);
      }
    },
    [originalOnMouseLeave],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsReady(false);

      if (originalOnClick) {
        originalOnClick(e);
      }
    },
    [originalOnClick],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const tooltipRef = window.__systemTooltipRef;
    if (!tooltipRef?.current || !contentString) return;

    if (isReady) {
      tooltipRef.current.open({
        anchorSelect: `[data-tooltip-anchor="${anchorId.current}"]`,
        content: contentString,
        place: tooltipPlace,
      });
    } else {
      tooltipRef.current.close();
    }
  }, [isReady, contentString, tooltipPlace]);

  return {
    elementRef,
    anchorId: anchorId.current,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
  };
}

export function withTooltip<T extends object>(
  WrappedComponent: ComponentType<T>,
) {
  return React.forwardRef<unknown, T & WithTooltipProps>((props, ref) => {
    const {
      title,
      tooltipContent,
      tooltipPlace = "bottom",
      tooltipFitToContent,
      ...restProps
    } = props;

    const handlers = restProps as Record<string, unknown>;
    const originalOnClick = handlers.onClick as
      | ((e: React.MouseEvent) => void)
      | undefined;
    const originalOnMouseEnter = handlers.onMouseEnter as
      | ((e: React.MouseEvent) => void)
      | undefined;
    const originalOnMouseLeave = handlers.onMouseLeave as
      | ((e: React.MouseEvent) => void)
      | undefined;

    if (title || tooltipContent) {
      const content: ReactNode = tooltipContent || title;
      const contentString = typeof content === "string" ? content : undefined;

      const {
        elementRef,
        anchorId,
        handleMouseEnter,
        handleMouseLeave,
        handleClick,
      } = useTooltipControl(
        originalOnClick,
        originalOnMouseEnter,
        originalOnMouseLeave,
        contentString,
        tooltipPlace,
      );

      if (tooltipFitToContent) {
        return (
          <span
            ref={elementRef as React.RefObject<HTMLSpanElement>}
            data-tooltip-anchor={anchorId}
            style={{ display: "inline-block", width: "fit-content" }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            onMouseDown={handleClick}
          >
            <WrappedComponent {...(restProps as T)} ref={ref} />
          </span>
        );
      }

      return (
        <WrappedComponent
          {...(restProps as T)}
          ref={(node: unknown) => {
            if (node) {
              (elementRef as React.RefObject<HTMLElement | null>).current =
                node as HTMLElement;
            }
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              (ref as React.RefObject<unknown>).current = node;
            }
          }}
          data-tooltip-anchor={anchorId}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onMouseDown={handleClick}
        />
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
      tooltipPlace = "bottom",
      tooltipFitToContent,
      ...restProps
    } = props;

    const handlers = restProps as Record<string, unknown>;
    const originalOnClick = handlers.onClick as
      | ((e: React.MouseEvent) => void)
      | undefined;
    const originalOnMouseEnter = handlers.onMouseEnter as
      | ((e: React.MouseEvent) => void)
      | undefined;
    const originalOnMouseLeave = handlers.onMouseLeave as
      | ((e: React.MouseEvent) => void)
      | undefined;

    if (title || tooltipContent) {
      const content: ReactNode = tooltipContent || title;
      const contentString = typeof content === "string" ? content : undefined;

      const {
        elementRef,
        anchorId,
        handleMouseEnter,
        handleMouseLeave,
        handleClick,
      } = useTooltipControl(
        originalOnClick,
        originalOnMouseEnter,
        originalOnMouseLeave,
        contentString,
        tooltipPlace,
      );

      if (tooltipFitToContent) {
        return (
          <span
            ref={elementRef as React.RefObject<HTMLSpanElement>}
            data-tooltip-anchor={anchorId}
            style={{ display: "inline-block", width: "fit-content" }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            onMouseDown={handleClick}
          >
            {React.createElement<React.ComponentPropsWithoutRef<T>>(Element, {
              ...(restProps as React.ComponentPropsWithoutRef<T>),
              ref,
            })}
          </span>
        );
      }

      return React.createElement<React.ComponentPropsWithoutRef<T>>(Element, {
        ...(restProps as React.ComponentPropsWithoutRef<T>),
        ref: (node: unknown) => {
          if (node) {
            (elementRef as React.RefObject<HTMLElement | null>).current =
              node as HTMLElement;
          }
          if (typeof ref === "function") {
            ref(node as React.ComponentRef<T>);
          } else if (ref) {
            (ref as React.RefObject<React.ComponentRef<T> | null>).current =
              node as React.ComponentRef<T>;
          }
        },
        "data-tooltip-anchor": anchorId,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onClick: handleClick,
        onMouseDown: handleClick,
      });
    }

    return React.createElement<React.ComponentPropsWithoutRef<T>>(Element, {
      ...(restProps as React.ComponentPropsWithoutRef<T>),
      ref,
    });
  });
}
