import React from "react";
import { ButtonsContainer, ArrowIcon } from "../styled-components";
import { ColorTheme, ThemeType } from "../../ColorTheme";
import { useTheme } from "styled-components";

export const HeaderButtons = ({
  onLeftClick,
  onRightClick,
  isLeftDisabled,
  isRightDisabled,
  isMobile
}: any) => {
  const theme = useTheme();
  // @ts-expect-error TS(2339): Property 'interfaceDirection' does not exist on ty... Remove this comment to see the full error message
  const isRtl = theme.interfaceDirection === "rtl";
  const marginSize = isMobile ? "12px" : "8px";
  return (
    <ButtonsContainer>
      // @ts-expect-error TS(2322): Type '{ children: Element; className: string; them... Remove this comment to see the full error message
      <ColorTheme
        className="arrow-previous"
        themeId={ThemeType.RoundButton}
        style={isRtl ? { marginLeft: marginSize } : { marginRight: marginSize }}
        onClick={onLeftClick}
        disabled={isLeftDisabled}
        isMobile={isMobile}
      >
        // @ts-expect-error TS(2769): No overload matches this call.
        <ArrowIcon previous isMobile={isMobile} />
      </ColorTheme>

      // @ts-expect-error TS(2322): Type '{ children: Element; className: string; them... Remove this comment to see the full error message
      <ColorTheme
        className="arrow-next"
        themeId={ThemeType.RoundButton}
        onClick={onRightClick}
        disabled={isRightDisabled}
        isMobile={isMobile}
      >
        // @ts-expect-error TS(2769): No overload matches this call.
        <ArrowIcon next isMobile={isMobile} />
      </ColorTheme>
    </ButtonsContainer>
  );
};
