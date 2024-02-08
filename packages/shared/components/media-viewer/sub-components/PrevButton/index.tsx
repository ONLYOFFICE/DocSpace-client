import React from "react";

import MediaPrevIcon from "PUBLIC_DIR/images/viewer.prew.react.svg";
import {
  StyledButtonScroll,
  StyledSwitchToolbar,
} from "../../MediaViewer.styled";

type PrevButtonProps = {
  prevClick?: VoidFunction;
};

export const PrevButton = ({ prevClick }: PrevButtonProps) => {
  return (
    <StyledSwitchToolbar left onClick={prevClick}>
      <StyledButtonScroll orientation="left">
        <MediaPrevIcon />
      </StyledButtonScroll>
    </StyledSwitchToolbar>
  );
};
