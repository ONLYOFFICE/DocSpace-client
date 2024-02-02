import React, { memo } from "react";

import IconVolumeMax from "PUBLIC_DIR/images/media.volumemax.react.svg";
import IconVolumeMuted from "PUBLIC_DIR/images/media.volumeoff.react.svg";
import IconVolumeMin from "PUBLIC_DIR/images/media.volumemin.react.svg";

import {
  IconWrapper,
  PlayerVolumeControlWrapper,
  VolumeWrapper,
} from "./PlayerVolumeControl.styled";

type PlayerVolumeControlProps = {
  volume: number;
  isMuted: boolean;
  toggleVolumeMute: VoidFunction;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const PlayerVolumeControl = memo(
  ({
    volume,
    isMuted,
    onChange,
    toggleVolumeMute,
  }: PlayerVolumeControlProps) => {
    return (
      <PlayerVolumeControlWrapper>
        <IconWrapper onClick={toggleVolumeMute}>
          {isMuted ? (
            <IconVolumeMuted />
          ) : volume >= 50 ? (
            <IconVolumeMax />
          ) : (
            <IconVolumeMin />
          )}
        </IconWrapper>
        <VolumeWrapper>
          <input
            style={{
              backgroundSize: `${volume}% 100%`,
            }}
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={onChange}
          />
        </VolumeWrapper>
      </PlayerVolumeControlWrapper>
    );
  },
);

PlayerVolumeControl.displayName = "PlayerVolumeControl";
