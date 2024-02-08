import React from "react";

import MediaNextIcon from "PUBLIC_DIR/images/viewer.next.react.svg";
import {
  StyledButtonScroll,
  StyledSwitchToolbar,
} from "../../MediaViewer.styled";

type NextButtonProps = {
  nextClick?: VoidFunction;
  isPDFFile: boolean;
};

export const NextButton = ({ nextClick, isPDFFile }: NextButtonProps) => {
  return (
    <StyledSwitchToolbar onClick={nextClick} isPDFFile={isPDFFile}>
      <StyledButtonScroll orientation="right">
        <MediaNextIcon />
      </StyledButtonScroll>
    </StyledSwitchToolbar>
  );
};
