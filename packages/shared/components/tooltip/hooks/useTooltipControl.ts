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

import { useCallback, useRef, useState, useEffect } from "react";
import {
  DEFAULT_DELAY_SHOW,
  SYSTEM_TOOLTIP_TOP_OFFSET,
} from "../Tooltip.constants";
import { checkIsSSR } from "../../../utils/device";

const shouldHandleTooltipEvent = (
  target: HTMLElement,
  currentTarget: HTMLElement,
): boolean => {
  const anchorElement =
    target.closest && target.closest("[data-tooltip-element]");
  return anchorElement === currentTarget;
};

const VIRTUAL_ANCHOR_STYLES = {
  position: "fixed",
  width: "1px",
  height: "1px",
  pointerEvents: "none",
  visibility: "hidden",
  zIndex: "-1",
} as const;

const createVirtualAnchor = (
  anchorId: string,
  contentString?: string,
): HTMLDivElement => {
  const anchor = document.createElement("div");
  anchor.setAttribute("data-tooltip-id", "system-tooltip");
  anchor.setAttribute("data-tooltip-anchor", anchorId);
  anchor.setAttribute("data-tooltip-content", contentString || "");

  Object.assign(anchor.style, VIRTUAL_ANCHOR_STYLES);

  return anchor;
};

export const useTooltipControl = (
  originalOnClick?: (e: React.MouseEvent<HTMLElement>) => void,
  originalOnMouseEnter?: (e: React.MouseEvent<HTMLElement>) => void,
  originalOnMouseLeave?: (e: React.MouseEvent<HTMLElement>) => void,
  contentString?: string,
) => {
  const [isReady, setIsReady] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const virtualAnchorRef = useRef<HTMLDivElement | null>(null);
  const anchorId = useRef<string>(
    `tooltip-${Math.floor(Math.random() * 1000000)}`,
  );

  useEffect(() => {
    return () => {
      if (virtualAnchorRef.current && !checkIsSSR()) {
        document.body.removeChild(virtualAnchorRef.current);
        virtualAnchorRef.current = null;
      }
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      const currentTarget = e.currentTarget as HTMLElement;

      if (!shouldHandleTooltipEvent(target, currentTarget)) {
        return;
      }
      if (!isReady && virtualAnchorRef.current) {
        virtualAnchorRef.current.style.left = `${e.clientX}px`;
        virtualAnchorRef.current.style.top = `${e.clientY + SYSTEM_TOOLTIP_TOP_OFFSET}px`;
      }
    },
    [isReady],
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      const currentTarget = e.currentTarget as HTMLElement;

      if (!shouldHandleTooltipEvent(target, currentTarget)) {
        return;
      }

      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (!virtualAnchorRef.current && !checkIsSSR()) {
        const anchor = createVirtualAnchor(anchorId.current, contentString);
        anchor.style.left = `${e.clientX}px`;
        anchor.style.top = `${e.clientY + SYSTEM_TOOLTIP_TOP_OFFSET}px`;
        document.body.appendChild(anchor);
        virtualAnchorRef.current = anchor;
      } else if (virtualAnchorRef.current) {
        virtualAnchorRef.current.style.left = `${e.clientX}px`;
        virtualAnchorRef.current.style.top = `${e.clientY + SYSTEM_TOOLTIP_TOP_OFFSET}px`;
      }

      if (isReady) {
        setIsReady(false);
        timeoutRef.current = setTimeout(() => {
          setIsReady(true);
        }, 100);
      } else {
        timeoutRef.current = setTimeout(() => {
          setIsReady(true);
        }, DEFAULT_DELAY_SHOW);
      }

      if (originalOnMouseEnter) {
        originalOnMouseEnter(e as React.MouseEvent<HTMLElement>);
      }
    },
    [originalOnMouseEnter, isReady, contentString],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      closeTimeoutRef.current = setTimeout(() => {
        setIsReady(false);
        if (virtualAnchorRef.current && !checkIsSSR()) {
          document.body.removeChild(virtualAnchorRef.current);
          virtualAnchorRef.current = null;
        }
      }, 50);

      if (originalOnMouseLeave) {
        originalOnMouseLeave(e as React.MouseEvent<HTMLElement>);
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
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }

      setIsReady(false);

      if (originalOnClick) {
        originalOnClick(e as React.MouseEvent<HTMLElement>);
      }
    },
    [originalOnClick],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (checkIsSSR()) return;
    if (!isReady) return;

    const handleDocumentClick = () => {
      setIsReady(false);
      const tooltipRef = window.__systemTooltipRef;
      if (tooltipRef?.current) {
        tooltipRef.current.close();
      }
    };

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [isReady]);

  useEffect(() => {
    const tooltipRef = window.__systemTooltipRef;
    if (!tooltipRef?.current || !contentString) return;

    if (isReady) {
      tooltipRef.current.open({
        anchorSelect: `[data-tooltip-anchor="${anchorId.current}"]`,
        content: contentString,
        place: "bottom-start",
      });
    } else {
      tooltipRef.current.close();
    }
  }, [isReady, contentString]);

  return {
    anchorId: anchorId.current,
    handleMouseEnter,
    handleMouseMove,
    handleMouseLeave,
    handleClick,
  };
};
