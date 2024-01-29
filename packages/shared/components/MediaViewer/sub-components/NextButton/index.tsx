import React from "react";

import MediaNextIcon from "PUBLIC_DIR/images/viewer.next.react.svg";
import {
  StyledButtonScroll,
  StyledSwitchToolbar,
} from "../../MediaViewer.styled";

type NextButtonProps = {
  nextClick: VoidFunction;
  isPdfFIle: boolean;
};

function NextButton({ nextClick, isPdfFIle }: NextButtonProps) {
  return (
    <StyledSwitchToolbar onClick={nextClick} isPdfFIle={isPdfFIle}>
      <StyledButtonScroll orientation="right">
        <MediaNextIcon />
      </StyledButtonScroll>
    </StyledSwitchToolbar>
  );
}

export default NextButton;
