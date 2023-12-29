import styled, { css } from "styled-components";
import { Base } from "../../../themes";

import StyledPreparationPortalProgress from "../sub-components/StyledPreparationPortalProgress";
import { ProgressColorTheme } from "../ColorTheme.types";

const getDefaultStyles = ({ $currentColorScheme, theme }: ProgressColorTheme) =>
  $currentColorScheme &&
  css`
    .preparation-portal_progress-line {
      background: ${theme.isBase ? $currentColorScheme.main.accent : "#FFFFFF"};
    }
  `;

StyledPreparationPortalProgress.defaultProps = { theme: Base };

export default styled(StyledPreparationPortalProgress)(getDefaultStyles);
