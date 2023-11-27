import styled, { css } from "styled-components";
import { StyledBar } from "../../main-button-mobile/styled-main-button";

const getDefaultStyles = ({
  $currentColorScheme,
  theme,
  error
}: any) =>
  $currentColorScheme &&
  css`
    background: ${error
      ? theme.mainButtonMobile.bar.errorBackground
      : theme.isBase
      ? $currentColorScheme.main.accent
      : "#FFFFFF"};
  `;

export default styled(StyledBar)(getDefaultStyles);
