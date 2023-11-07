import styled, { css } from "styled-components";
import { StyledComboButton } from "SRC_DIR/combobox/sub-components/styled-combobutton";
import Base from "SRC_DIR/themes/base";

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
