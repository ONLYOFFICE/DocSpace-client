import styled from "styled-components";

import StyledText from "../../link/Link.styled";

import { LinkColorTheme } from "../ColorTheme.types";

const LinkTheme = styled(StyledText)<LinkColorTheme>`
  color: ${(props) => props.$currentColorScheme?.main.accent};

  &:hover {
    color: ${(props) =>
      !props.noHover && props.$currentColorScheme?.main.accent};
    text-decoration: underline;
  }
`;

export default LinkTheme;
