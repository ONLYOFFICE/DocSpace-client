import styled from "styled-components";
import { Base } from "../../themes";
import { mobile, tablet } from "../../utils";

const InputWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  direction: ltr;
  input {
    height: 120px;
    width: 100px;
    display: block;
    background: ${(props) => props.theme.codeInput.background};
    border: ${(props) => props.theme.codeInput.border};
    color: ${(props) => props.theme.codeInput.color};
    box-sizing: border-box;
    border-radius: 8px;
    margin: 0 4px;
    text-align: center;
    font-size: ${(props) => props.theme.getCorrectFontSize("72px")};

    @media ${tablet} {
      height: 76px;
      width: 64px;
      font-size: ${(props) => props.theme.getCorrectFontSize("48px")};
    }

    @media ${mobile} {
      height: 48px;
      width: 40px;
      font-size: ${(props) => props.theme.getCorrectFontSize("32px")};
    }

    &:last-child {
      margin: 0;
    }
  }

  input:focus {
    border: 1px solid #5299e0;
    outline: none;
  }

  input:disabled {
    color: ${(props) => props.theme.codeInput.disabledColor};
    background: ${(props) => props.theme.codeInput.disabledBackground};
    border: ${(props) => props.theme.codeInput.disabledBorder};
    outline: none;
  }

  hr {
    width: 24px;
    height: 1px;
    background: ${(props) => props.theme.codeInput.lineColor};
    border: none;
    margin: 0 16px;

    @media ${mobile} {
      margin: 0 4px;
    }
  }
  :placeholder-shown {
    direction: ltr;
  }
`;

InputWrapper.defaultProps = { theme: Base };

export default InputWrapper;
