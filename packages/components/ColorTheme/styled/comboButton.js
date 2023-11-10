import styled, { css } from "styled-components";
import { StyledComboButton } from "../../combobox/sub-components/styled-combobutton";

const getDefaultStyles = ({ $currentColorScheme, isOpen, theme }) =>
  $currentColorScheme &&
  theme.isBase &&
  css`
    border-color: ${isOpen && $currentColorScheme.main.accent};

    :focus {
      border-color: ${isOpen && $currentColorScheme.main.accent};
    }
  `;

export default styled(StyledComboButton)(getDefaultStyles);
