import styled, { css } from "styled-components";
import commonIconsStyles from "../../utils/common-icons-style";
import Base from "../../themes/base";
import StyledMuteIcon from "./sub-components/StyledMuteIcon";

const getDefaultStyles = ({ $currentColorScheme, theme }) =>
  $currentColorScheme &&
  css`
    ${commonIconsStyles}
    svg {
      path:first-child {
        stroke: ${theme.isBase && $currentColorScheme.main.accent};
      }
      path {
        fill: ${theme.isBase && $currentColorScheme.main.accent};
      }
      rect {
        fill: ${theme.isBase && $currentColorScheme.main.accent};
      }
    }

    &:hover {
      svg {
        path {
          fill: ${theme.isBase && $currentColorScheme.main.accent};
        }
      }
    }
  `;

StyledMuteIcon.defaultProps = { theme: Base };

export default styled(StyledMuteIcon)(getDefaultStyles);
