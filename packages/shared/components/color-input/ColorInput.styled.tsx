import styled, { css } from "styled-components";
import { commonInputStyles } from "../../utils";
import { Base } from "../../themes";

export const Wrapper = styled.div`
  position: relative;
  .hex-value {
    ${commonInputStyles}
    box-sizing: border-box;
    height: 32px;
    padding: 6px 8px;

    :focus-visible {
      outline: none;
    }
  }

  .drop-down-item-hex {
    cursor: auto;
    background: ${(props) => props.theme.dropDown.background};
  }
`;

Wrapper.defaultProps = { theme: Base };

export const InputWrapper = styled.div<{ scale?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;

  width: ${(props) => (props.scale ? "100%" : "fit-content")};

  input {
    font-family: ${(props) => props.theme.fontFamily};
  }
`;

InputWrapper.defaultProps = { theme: Base };

export const ColorBlock = styled.span<{ isDisabled?: boolean }>`
  position: absolute;
  right: 8px;
  cursor: pointer;

  width: 20px;
  height: 20px;

  border-radius: 2px;

  background-color: ${(props) => props.color};

  ${(props) =>
    props.isDisabled &&
    css`
      cursor: auto;
      pointer-events: none;
    `}
`;
