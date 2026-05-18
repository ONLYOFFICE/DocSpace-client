// (c) Copyright Ascensio System SIA 2009-2026
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

import React from "react";

import {
  PANEL_MIN_WIDTH,
  PANEL_MAX_WIDTH,
  MIN_SECTION_WIDTH,
  type PanelPosition,
} from "../../_api/aiAgentSettings";
import styles from "./ResizeHandle.module.scss";

const KEYBOARD_STEP = 20;

const getSidebarWidth = () => {
  const el = document.getElementById("article-container");
  return el ? el.offsetWidth : 252;
};

type ResizeHandleProps = {
  position: PanelPosition;
  panelRef: React.RefObject<HTMLDivElement | null>;
  rootRef: React.RefObject<HTMLDivElement | null>;
  onResizeEnd: (width: number) => void;
};

const ResizeHandle = ({
  position,
  panelRef,
  rootRef,
  onResizeEnd,
}: ResizeHandleProps) => {
  const widthRef = React.useRef(0);

  const getMaxWidth = React.useCallback(() => {
    const vw = window.innerWidth;
    return Math.min(PANEL_MAX_WIDTH, vw - getSidebarWidth() - MIN_SECTION_WIDTH);
  }, []);

  const clamp = React.useCallback(
    (value: number) => Math.max(PANEL_MIN_WIDTH, Math.min(value, getMaxWidth())),
    [getMaxWidth],
  );

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);

      const panel = panelRef.current;
      if (!panel) return;

      const startX = e.clientX;
      const startWidth = panel.offsetWidth;
      widthRef.current = startWidth;

      const isRtl = document.documentElement.dir === "rtl";
      const root = rootRef.current;
      if (root) root.setAttribute("data-resizing", "true");
      document.body.style.cursor = "col-resize";

      const onMove = (ev: PointerEvent) => {
        const delta = ev.clientX - startX;

        let newWidth: number;
        if (position === "right") {
          newWidth = isRtl ? startWidth + delta : startWidth - delta;
        } else {
          newWidth = isRtl ? startWidth - delta : startWidth + delta;
        }

        newWidth = clamp(newWidth);
        widthRef.current = newWidth;
        panel.style.width = `${newWidth}px`;
      };

      const cleanup = () => {
        target.removeEventListener("pointermove", onMove);
        target.removeEventListener("pointerup", cleanup);
        target.removeEventListener("lostpointercapture", cleanup);
        if (root) root.removeAttribute("data-resizing");
        document.body.style.cursor = "";
        onResizeEnd(widthRef.current);
      };

      target.addEventListener("pointermove", onMove);
      target.addEventListener("pointerup", cleanup);
      target.addEventListener("lostpointercapture", cleanup);
    },
    [position, panelRef, rootRef, onResizeEnd, clamp],
  );

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const panel = panelRef.current;
      if (!panel) return;

      const current = panel.offsetWidth;
      let newWidth: number | null = null;

      if (e.key === "ArrowLeft") {
        newWidth =
          position === "right"
            ? current + KEYBOARD_STEP
            : current - KEYBOARD_STEP;
      } else if (e.key === "ArrowRight") {
        newWidth =
          position === "right"
            ? current - KEYBOARD_STEP
            : current + KEYBOARD_STEP;
      } else if (e.key === "Home") {
        newWidth = PANEL_MIN_WIDTH;
      } else if (e.key === "End") {
        newWidth = getMaxWidth();
      }

      if (newWidth !== null) {
        e.preventDefault();
        newWidth = clamp(newWidth);
        panel.style.width = `${newWidth}px`;
        onResizeEnd(newWidth);
      }
    },
    [position, panelRef, onResizeEnd, clamp, getMaxWidth],
  );

  const positionClass =
    position === "right" ? styles.positionRight : styles.positionLeft;

  return (
    <div
      className={`${styles.resizeHandle} ${positionClass}`}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize chat panel"
      aria-valuemin={PANEL_MIN_WIDTH}
      aria-valuemax={PANEL_MAX_WIDTH}
      aria-valuenow={panelRef.current?.offsetWidth ?? PANEL_MIN_WIDTH}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    >
      <div className={styles.gripDots}>
        <div className={styles.gripDot} />
        <div className={styles.gripDot} />
        <div className={styles.gripDot} />
      </div>
    </div>
  );
};

export default ResizeHandle;
