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

import React, { useRef } from "react";
import { flip, shift, offset } from "@floating-ui/dom";
import { Tooltip as ReactTooltip, TooltipRefProps } from "react-tooltip";
import { withTooltipForElement } from "./withTooltip";

import { Portal } from "../portal";

import { DEFAULT_OFFSET } from "./Tooltip.constants";
import styles from "./Tooltip.module.scss";

declare global {
  interface Window {
    __systemTooltipRef?: React.RefObject<TooltipRefProps | null>;
  }
}

const globalCloseEvents = {
  escape: true,
  resize: true,
  scroll: true,
  clickOutsideAnchor: true,
};

const RootTooltip = () => {
  const systemTooltipRef = useRef<TooltipRefProps>(null);
  const infoTooltipRef = useRef<HTMLDivElement>(null);

  if (typeof window !== "undefined") {
    window.__systemTooltipRef = systemTooltipRef;
  }

  const renderTooltip = (
    id: string,
    ref:
      | React.RefObject<TooltipRefProps | null>
      | React.RefObject<HTMLDivElement | null>,
    testId: string,
    imperativeMode: boolean,
  ) => {
    return (
      <div
        ref={
          imperativeMode
            ? undefined
            : (ref as React.RefObject<HTMLDivElement | null>)
        }
        className={styles.tooltip}
        data-testid={testId}
      >
        <ReactTooltip
          ref={
            imperativeMode
              ? (ref as React.RefObject<TooltipRefProps | null>)
              : undefined
          }
          id={id}
          opacity={1}
          place="bottom"
          noArrow
          className="__react_component_tooltip"
          globalCloseEvents={globalCloseEvents}
          delayShow={0}
          clickable={false}
          imperativeModeOnly={imperativeMode}
          middlewares={[
            offset(DEFAULT_OFFSET),
            flip({
              crossAxis: false,
              fallbackPlacements: [
                "right",
                "bottom",
                "left",
                "top",
                "top-start",
                "top-end",
                "right-start",
                "right-end",
                "bottom-start",
                "bottom-end",
                "left-start",
                "left-end",
              ],
            }),
            shift(),
          ]}
        />
      </div>
    );
  };

  const systemTooltip = renderTooltip(
    "system-tooltip",
    systemTooltipRef,
    "system-tooltip-container",
    true,
  );

  const infoTooltip = renderTooltip(
    "info-tooltip",
    infoTooltipRef,
    "info-tooltip-container",
    false,
  );

  const rootElement = document?.getElementById("root");

  return (
    <>
      <Portal
        element={systemTooltip}
        appendTo={rootElement || undefined}
        visible
      />
      <Portal
        element={infoTooltip}
        appendTo={rootElement || undefined}
        visible
      />
    </>
  );
};

RootTooltip.displayName = "RootTooltip";

export { RootTooltip };
export { withTooltip, withTooltipForElement } from "./withTooltip";

export const DivWithTooltip = withTooltipForElement("div");
export const SpanWithTooltip = withTooltipForElement("span");
export const LabelWithTooltip = withTooltipForElement("label");
export const ButtonWithTooltip = withTooltipForElement("button");
