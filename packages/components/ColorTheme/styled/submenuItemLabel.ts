import styled, { css } from "styled-components";

import { StyledSubmenuItemLabel } from "../../submenu/styled-submenu";

const getDefaultStyles = ({
  $currentColorScheme,
  isActive
}: any) =>
  $currentColorScheme &&
  css`
    background-color: ${isActive ? $currentColorScheme.main.accent : "none"};

    &:hover {
      background-color: ${isActive && $currentColorScheme.main.accent};
    }
  `;

export default styled(StyledSubmenuItemLabel)(getDefaultStyles);
