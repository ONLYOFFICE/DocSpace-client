import styled, { css } from "styled-components";
import StyledIndicator from "./sub-components/StyledIndicator";

const getDefaultStyles = ({
  $currentColorScheme
}: any) =>
  $currentColorScheme &&
  css`
    background: ${$currentColorScheme.main.accent};

    &:hover {
      background: ${$currentColorScheme.main.accent};
    }
  `;

export default styled(StyledIndicator)(getDefaultStyles);
