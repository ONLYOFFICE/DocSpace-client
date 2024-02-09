import React, { useRef, useImperativeHandle, forwardRef } from "react";

import { formatTime } from "../../MediaViewer.utils";

import type {
  PlayerTimelineProps,
  PlayerTimelineRef,
} from "./PlayerTimeline.props";
import {
  HoverProgress,
  PlayerTimelineWrapper,
  Progress,
} from "./PlayerTimeline.styled";

const PlayerTimeline = forwardRef<PlayerTimelineRef, PlayerTimelineProps>(
  ({ value, duration, onChange, onMouseEnter, onMouseLeave }, ref) => {
    const timelineTooltipRef = useRef<HTMLTimeElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const hoverProgressRef = useRef<HTMLDivElement>(null);
    const setTimeoutTimelineTooltipRef = useRef<NodeJS.Timeout>();
    const pregressRef = useRef<HTMLDivElement>(null);

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

      const time = Math.floor(percent * duration);

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

    useImperativeHandle(
      ref,
      () => {
        return {
          setProgress: (progress: number) => {
            if (!pregressRef.current) return;

            pregressRef.current.style.width = `${progress * 100}%`;
          },
        };
      },
      [],
    );

    return (
      <PlayerTimelineWrapper
        ref={timelineRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <time ref={timelineTooltipRef}>00:00</time>
        <Progress ref={pregressRef} />
        <HoverProgress ref={hoverProgressRef} />
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
        />
      </PlayerTimelineWrapper>
    );
  },
);

PlayerTimeline.displayName = "PlayerTimeline";

export { PlayerTimeline };
