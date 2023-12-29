import styled, { css } from "styled-components";

import { Base } from "../../themes";

const StyledSearchInput = styled.div<{ isScale?: boolean }>`
  font-family: Open Sans;
  font-style: normal;

  ${({ isScale }) =>
    isScale &&
    css`
      width: 100%;
    `}

  .search-input-block {
    max-height: 32px;

    & > input {
      font-size: ${(props) =>
        props.theme.getCorrectFontSize(props.theme.searchInput.fontSize)};
      font-weight: ${(props) => props.theme.searchInput.fontWeight};
    }
  }

  svg {
    path {
      fill: ${(props) => props.theme.searchInput.iconColor};
    }
  }
  &:hover {
    svg {
      path {
        fill: ${(props) => props.theme.searchInput.hoverIconColor};
      }
    }
  }
`;

StyledSearchInput.defaultProps = { theme: Base };
export default StyledSearchInput;
