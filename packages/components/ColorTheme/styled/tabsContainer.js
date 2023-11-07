import styled, { css } from "styled-components";
import { Label } from "SRC_DIR/tabs-container/styled-tabs-container";
import Base from "SRC_DIR/themes/base";

const getDefaultStyles = ({ $currentColorScheme, selected, theme }) =>
  $currentColorScheme &&
  css`
    background-color: ${selected && $currentColorScheme.main.accent} !important;

    .title_style {
      color: ${selected && $currentColorScheme.text.accent};
    }
  `;

Label.defaultProps = { theme: Base };

export default styled(Label)(getDefaultStyles);
