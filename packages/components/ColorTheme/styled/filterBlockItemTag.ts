import styled, { css } from "styled-components";
import Base from "../../themes/base";
import StyledFilterBlockItemTag from "./sub-components/StyledFilterBlockItemTag";

const getDefaultStyles = ({
  $currentColorScheme,
  isSelected,
  theme
}: any) =>
  $currentColorScheme &&
  isSelected &&
  css`
    background: ${$currentColorScheme.main.accent};
    border-color: ${$currentColorScheme.main.accent};

    .filter-text {
      color: ${$currentColorScheme.textColor};
    }

    &:hover {
      background: ${$currentColorScheme.main.accent};
      border-color: ${$currentColorScheme.main.accent};
    }
  `;

StyledFilterBlockItemTag.defaultProps = {
  theme: Base,
};

export default styled(StyledFilterBlockItemTag)(getDefaultStyles);
