import styled, { css } from "styled-components";
import StyledIndicator from "../sub-components/StyledIndicator";
import { TColorScheme } from "../../../themes";

const getDefaultStyles = ({
  $currentColorScheme,
}: {
  $currentColorScheme?: TColorScheme;
}) =>
  $currentColorScheme &&
  css`
    background: ${$currentColorScheme.main.accent};

    &:hover {
      background: ${$currentColorScheme.main.accent};
    }
  `;

export default styled(StyledIndicator)(getDefaultStyles);
