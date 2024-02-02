import React, { memo } from "react";

import IconPlay from "PUBLIC_DIR/images/videoplayer.play.react.svg";
import IconStop from "PUBLIC_DIR/images/videoplayer.stop.react.svg";

import { WrapperPlayerPlayButton } from "./PlayerPlayButton.styled";
import type { PlayerPlayButtonProps } from "./PlayerPlayButton.types";

export const PlayerPlayButton = memo(
  ({ isPlaying, onClick }: PlayerPlayButtonProps) => {
    const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
      event.stopPropagation();
    };
    return (
      <WrapperPlayerPlayButton onClick={onClick} onTouchStart={onTouchStart}>
        {isPlaying ? <IconStop /> : <IconPlay />}
      </WrapperPlayerPlayButton>
    );
  },
);

PlayerPlayButton.displayName = "PlayerPlayButton";
