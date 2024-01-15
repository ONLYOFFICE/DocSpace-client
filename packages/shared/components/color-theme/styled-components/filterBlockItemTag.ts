import styled, { css } from "styled-components";
import { Base, TColorScheme } from "../../../themes";
import StyledFilterBlockItemTag from "../sub-components/StyledFilterBlockItemTag";

const getDefaultStyles = ({
  $currentColorScheme,
  isSelected,
}: {
  $currentColorScheme?: TColorScheme;
  isSelected?: boolean;
}) =>
  $currentColorScheme &&
  isSelected &&
  css`
    background: ${$currentColorScheme.main.accent};
    border-color: ${$currentColorScheme.main.accent};

    .filter-text {
      color: ${$currentColorScheme.text.accent};
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
