import React from "react";
import { useTheme } from "styled-components";

import {
  StyledRoundButtonTheme,
  ButtonsContainer,
  ArrowIcon,
} from "../Calendar.styled";
import { HeaderButtonsProps } from "../Calendar.types";

export const HeaderButtons = ({
  onLeftClick,
  onRightClick,
  isLeftDisabled,
  isRightDisabled,
  isMobile,
}: HeaderButtonsProps) => {
  const theme = useTheme();
  const isRtl = theme?.interfaceDirection === "rtl";
  const marginSize = isMobile ? "12px" : "8px";
  return (
    <ButtonsContainer>
      <StyledRoundButtonTheme
        className="arrow-previous"
        style={isRtl ? { marginLeft: marginSize } : { marginRight: marginSize }}
        onClick={onLeftClick}
        disabled={isLeftDisabled}
        isMobile={isMobile}
        $currentColorScheme={theme?.currentColorScheme}
      >
        <ArrowIcon previous isMobile={isMobile} />
      </StyledRoundButtonTheme>

      <StyledRoundButtonTheme
        className="arrow-next"
        onClick={onRightClick}
        disabled={isRightDisabled}
        isMobile={isMobile}
        $currentColorScheme={theme?.currentColorScheme}
      >
        <ArrowIcon next isMobile={isMobile} />
      </StyledRoundButtonTheme>
    </ButtonsContainer>
  );
};
