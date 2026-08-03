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

import React, { useRef, useImperativeHandle } from "react";
import classNames from "classnames";
import { isMobile } from "react-device-detect";
import { formatTime } from "../../MediaViewer.utils";

import type { PlayerTimelineProps } from "./PlayerTimeline.props";

import styles from "./PlayerTimeline.module.scss";

const PlayerTimeline = ({
  ref,
  value,
  duration,
  onChange,
  onMouseEnter,
  onMouseLeave,
}: PlayerTimelineProps) => {
  const timelineTooltipRef = useRef<HTMLTimeElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const hoverProgressRef = useRef<HTMLDivElement>(null);
  const setTimeoutTimelineTooltipRef = useRef<NodeJS.Timeout>(undefined);
  const progressRef = useRef<HTMLDivElement>(null);

  const showTimelineTooltip = () => {
    if (!timelineTooltipRef.current) return;

    const callback = () => {
      if (timelineTooltipRef.current) {
        timelineTooltipRef.current.style.removeProperty("display");
        setTimeoutTimelineTooltipRef.current = undefined;
      }
    };

    if (setTimeoutTimelineTooltipRef.current) {
      clearTimeout(setTimeoutTimelineTooltipRef.current);
      setTimeoutTimelineTooltipRef.current = setTimeout(callback, 500);
    } else {
      timelineTooltipRef.current.style.display = "block";
      setTimeoutTimelineTooltipRef.current = setTimeout(callback, 500);
    }
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!timelineTooltipRef.current || !timelineRef.current) return;

    const { clientWidth } = timelineRef.current;

    const percent = Number(event.target.value) / 100;

    const offsetX = clientWidth * percent;

    const time = percent * duration;

    const left =
      offsetX < 20
        ? 20
        : offsetX > clientWidth - 20
          ? clientWidth - 20
          : offsetX;

    timelineTooltipRef.current.style.left = `${left}px`;
    timelineTooltipRef.current.innerText = formatTime(time);

    showTimelineTooltip();

    onChange(event);
  };

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (
      !timelineTooltipRef.current ||
      !timelineRef.current ||
      !hoverProgressRef.current
    )
      return;

    const { clientWidth } = timelineRef.current;
    const { max, min } = Math;

    const offsetX = min(max(event.nativeEvent.offsetX, 0), clientWidth);

    const percent = Math.floor((offsetX / clientWidth) * duration);

    hoverProgressRef.current.style.width = `${offsetX}px`;

    const left =
      offsetX < 20
        ? 20
        : offsetX > clientWidth - 20
          ? clientWidth - 20
          : offsetX;

    timelineTooltipRef.current.style.left = `${left}px`;
    timelineTooltipRef.current.innerText = formatTime(percent);
  };

  useImperativeHandle(ref, () => {
    return {
      setProgress: (progress: number) => {
        if (!progressRef.current) return;

        progressRef.current.style.width = `${progress * 100}%`;
      },
    };
  }, []);

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.isMobile]: isMobile,
      })}
      ref={timelineRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-testid="player-timeline"
      role="group"
      aria-label="Video timeline"
    >
      <time
        ref={timelineTooltipRef}
        data-testid="timeline-tooltip"
        aria-live="polite"
      >
        00:00
      </time>
      <div
        ref={progressRef}
        className={styles.progress}
        data-testid="timeline-progress"
        role="progressbar"
        aria-label="Video progress"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      />
      <div
        ref={hoverProgressRef}
        className={styles.hoverProgress}
        data-testid="timeline-hover-progress"
        aria-hidden="true"
      />
      <input
        min="0"
        max="100"
        step="any"
        type="range"
        value={value}
        onChange={handleOnChange}
        style={{
          backgroundSize: `${value}% 100%`,
        }}
        data-testid="timeline-slider"
      />
    </div>
  );
};

PlayerTimeline.displayName = "PlayerTimeline";

export { PlayerTimeline };
