import styled, { css } from "styled-components";

import { StyledSubmenuItemLabel } from "SRC_DIR/submenu/styled-submenu";

const getDefaultStyles = ({ $currentColorScheme, isActive }) =>
  $currentColorScheme &&
  css`
    background-color: ${isActive ? $currentColorScheme.main.accent : "none"};

    &:hover {
      background-color: ${isActive && $currentColorScheme.main.accent};
    }
  `;

export default styled(StyledSubmenuItemLabel)(getDefaultStyles);
