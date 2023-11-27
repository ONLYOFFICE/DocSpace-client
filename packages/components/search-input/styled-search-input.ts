import styled, { css } from "styled-components";
import Base from "../themes/base";

const StyledSearchInput = styled.div`
  font-family: Open Sans;
  font-style: normal;

  // @ts-expect-error TS(2339): Property 'isScale' does not exist on type 'Omit<De... Remove this comment to see the full error message
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
