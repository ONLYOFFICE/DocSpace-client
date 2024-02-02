import React, { memo } from "react";
import IconExitFullScreen from "PUBLIC_DIR/images/videoplayer.exit.react.svg";
import IconFullScreen from "PUBLIC_DIR/images/videoplayer.full.react.svg";
import PlayerFullSceenProps from "./PlayerFullScreen.props";

import { PlayerFullSceenWrapper } from "./PlayerFullScreen.styled";

export const PlayerFullScreen = memo(
  ({ isAudio, onClick, isFullScreen }: PlayerFullSceenProps) => {
    if (isAudio) return;

    return (
      <PlayerFullSceenWrapper onClick={onClick}>
        {isFullScreen ? <IconExitFullScreen /> : <IconFullScreen />}
      </PlayerFullSceenWrapper>
    );
  },
);

PlayerFullScreen.displayName = "PlayerFullScreen";
