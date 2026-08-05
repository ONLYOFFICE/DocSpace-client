/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useEffect, useRef } from "react";
import { useSpring, animated } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import { isDesktop } from "react-device-detect";

import classNames from "classnames";
import MainPanelProps from "./MainPanel.props";
import styles from "./MainPanel.module.scss";

const MainPanel = ({
  ref,
  isLoading,
  isFistImage,
  isLastImage,
  src,
  onNext,
  onPrev,
}: MainPanelProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [style, api] = useSpring(() => ({
    x: 0,
    scale: 1,
  }));

  const resetState = useCallback(() => {
    api.set({ x: 0 });
  }, [api]);

  useEffect(() => {
    resetState();
  }, [resetState, src]);

  useGesture(
    {
      onDrag: ({ offset: [dx], movement: [mdx] }) => {
        if (isDesktop) return;

        api.start({
          x:
            (isFistImage && mdx > 0) || (isLastImage && mdx < 0)
              ? style.x.get()
              : dx,
          immediate: true,
        });
      },
      onDragEnd: ({ movement: [mdx] }) => {
        if (isDesktop) return;

        const width = window.innerWidth;

        if (mdx < -width / 4) {
          return onNext?.();
        }
        if (mdx > width / 4) {
          return onPrev?.();
        }

        api.start({ x: 0 });
      },
    },
    {
      drag: {
        from: () => [style.x.get(), 0],
        axis: "x",
      },
      pinch: {
        scaleBounds: { min: 0.5, max: 5 },
        from: () => [style.scale.get(), 0],
        threshold: [0.1, 5],
        rubberband: false,
        pinchOnWheel: false,
      },
      target: wrapperRef,
    },
  );

  return (
    // @ts-expect-error - React Spring types issue with React 19
    <animated.section
      ref={wrapperRef}
      style={style}
      className={classNames(styles.wrapper, {
        [styles.isDesktop]: isDesktop,
      })}
      data-testid="main-panel-wrapper"
      role="region"
      aria-label="PDF viewer main panel"
    >
      <div
        id="mainPanel"
        ref={ref}
        className={styles.content}
        data-loading={isLoading}
        data-testid="main-panel-content"
        role="document"
        aria-busy={isLoading}
        aria-label={`PDF document ${src}`}
      />
    </animated.section>
  );
};

MainPanel.displayName = "MainPanel";

export { MainPanel };
