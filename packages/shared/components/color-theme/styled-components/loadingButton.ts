import styled, { css } from "styled-components";

import { TColorScheme } from "../../../themes";
import { StyledCircleWrap } from "../sub-components/StyledLoadingButton";

const getDefaultStyles = ({
  $currentColorScheme,
}: {
  $currentColorScheme?: TColorScheme;
}) =>
  $currentColorScheme &&
  css`
    .circle__mask .circle__fill {
      background-color: ${$currentColorScheme.main?.accent} !important;
    }

    .loading-button {
      color: ${$currentColorScheme.main?.accent};
    }
  `;

export default styled(StyledCircleWrap)(getDefaultStyles);
