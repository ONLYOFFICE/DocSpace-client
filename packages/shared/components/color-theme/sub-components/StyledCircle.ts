import styled, { css, keyframes } from "styled-components";
import { Base } from "../../../themes";

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const StyledCircle = styled.div<{
  percent: number;
  isAnimation?: boolean;
  inConversion?: boolean;
}>`
    .circle__mask,
    .circle__fill {
      width: 16px;
      height: 16px;
      position: absolute;
      border-radius: 50%;
    }
  
    ${(props) =>
      props.percent === 0 || (props.isAnimation && props.inConversion)
        ? css`
            .circle__fill {
              animation: ${rotate360} 2s linear infinite;
              transform: translate(0);
            }
          `
        : css`
            .circle__mask {
              clip: rect(0px, 16px, 16px, 8px);
            }

            .circle__fill {
              animation: fill-rotate ease-in-out none;
              transform: rotate(${props.percent * 1.8}deg);
            }
          `}
  
    .circle__mask .circle__fill {
      clip: rect(0px, 8px, 16px, 0px);
      background-color: ${(props) =>
        props.theme.filesPanels.upload.loadingButton.color};
    }
  
    .circle__mask.circle__full {
      animation: fill-rotate ease-in-out none;
  =    transform: rotate(${(props) => props.percent * 1.8}deg);
    }
  
    @keyframes fill-rotate {
      0% {
        transform: rotate(0deg);
      }
      100% {
  =      transform: rotate(${(props) => props.percent * 1.8}deg);
      }
    }
  `;

StyledCircle.defaultProps = { theme: Base };

export default StyledCircle;
