import styled, { css } from "styled-components";
import { Base } from "../../themes";

const TimeInput = styled.div<{ hasError?: boolean; isFocused?: boolean }>`
  width: 57px;
  height: 32px;
  box-sizing: border-box;
  padding: 0px 8px;
  direction: ltr;

  border: 1px solid #d0d5da;
  border-radius: 3px;

  transition: "all 0.2s ease 0s";

  display: flex;
  align-items: center;

  border-color: ${(props) => (props.hasError ? "#f21c0e" : "#d0d5da")};

  background-color: ${(props) => props.theme.input.backgroundColor};

  ${(props) =>
    props.isFocused &&
    css`
      border-color: #4781d1;
    `}

  :focus {
    border-color: #4781d1;
  }

  input {
    padding: 0;
  }

  input:last-of-type {
    text-align: end;
  }

  input[type="search"]::-webkit-search-decoration,
  input[type="search"]::-webkit-search-cancel-button,
  input[type="search"]::-webkit-search-results-button,
  input[type="search"]::-webkit-search-results-decoration {
    -webkit-appearance: none;
  }
`;

TimeInput.defaultProps = { theme: Base };

export default TimeInput;
