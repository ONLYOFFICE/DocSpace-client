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
  useCallback,
  useRef,
  useState,
  useEffect,
} from "react";
import type {
  TTooltipPlace,
  MouseEventHandler,
  TooltipHandlers,
  WithTooltipProps,
  ComponentProps,
} from "./Tooltip.types";
import { DEFAULT_DELAY_SHOW } from "./Tooltip.constants";

function useTooltipControl(
  originalOnClick?: MouseEventHandler,
  originalOnMouseEnter?: MouseEventHandler,
  originalOnMouseLeave?: MouseEventHandler,
  contentString?: string,
  tooltipPlace: TTooltipPlace = "bottom",
) {
  const [isReady, setIsReady] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
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
    anchorId: anchorId.current,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
  };
}

function createTooltipWrapper<TProps extends ComponentProps>(
  renderElement: (
    props: TProps,
    ref: React.Ref<HTMLElement>,
    tooltipHandlers?: TooltipHandlers,
  ) => React.ReactElement,
) {
  type Props = TProps & WithTooltipProps;

  return React.forwardRef<HTMLElement, Props>((props, ref) => {
    const {
      title,
      tooltipContent,
      tooltipPlace = "bottom",
      tooltipFitToContent,
      ...restProps
    } = props;

    const originalOnClick = restProps.onClick;
    const originalOnMouseEnter = restProps.onMouseEnter;
    const originalOnMouseLeave = restProps.onMouseLeave;

    if (title || tooltipContent) {
      const content = tooltipContent || title;
      const contentString = typeof content === "string" ? content : undefined;

      const tooltipHandlers = useTooltipControl(
        originalOnClick,
        originalOnMouseEnter,
        originalOnMouseLeave,
        contentString,
        tooltipPlace,
      );

      if (tooltipFitToContent) {
        return (
          <span
            data-tooltip-anchor={tooltipHandlers.anchorId}
            style={{ display: "inline-block", width: "fit-content" }}
            onMouseEnter={tooltipHandlers.handleMouseEnter}
            onMouseLeave={tooltipHandlers.handleMouseLeave}
            onClick={tooltipHandlers.handleClick}
            onMouseDown={tooltipHandlers.handleClick}
          >
            {renderElement(restProps as unknown as TProps, ref)}
          </span>
        );
      }

      return renderElement(
        restProps as unknown as TProps,
        ref,
        tooltipHandlers,
      );
    }

    return renderElement(restProps as unknown as TProps, ref);
  });
}

export function withTooltip<T extends ComponentProps>(
  WrappedComponent: ComponentType<T>,
) {
  return createTooltipWrapper<T>((props, ref, tooltipHandlers) => {
    if (tooltipHandlers) {
      return (
        <WrappedComponent
          {...props}
          ref={ref as React.Ref<never>}
          data-tooltip-anchor={tooltipHandlers.anchorId}
          onMouseEnter={tooltipHandlers.handleMouseEnter}
          onMouseLeave={tooltipHandlers.handleMouseLeave}
          onClick={tooltipHandlers.handleClick}
          onMouseDown={tooltipHandlers.handleClick}
        />
      );
    }
    return <WrappedComponent {...props} ref={ref as React.Ref<never>} />;
  });
}

export function withTooltipForElement<
  T extends keyof React.JSX.IntrinsicElements = "div",
>(Element: T = "div" as T) {
  type ElementProps = React.ComponentPropsWithoutRef<T> & ComponentProps;

  return createTooltipWrapper<ElementProps>((props, ref, tooltipHandlers) => {
    if (tooltipHandlers) {
      return React.createElement(Element, {
        ...props,
        ref,
        "data-tooltip-anchor": tooltipHandlers.anchorId,
        onMouseEnter: tooltipHandlers.handleMouseEnter,
        onMouseLeave: tooltipHandlers.handleMouseLeave,
        onClick: tooltipHandlers.handleClick,
        onMouseDown: tooltipHandlers.handleClick,
      });
    }
    return React.createElement(Element, { ...props, ref });
  });
}
