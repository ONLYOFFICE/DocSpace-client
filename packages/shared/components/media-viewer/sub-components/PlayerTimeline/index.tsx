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
