import styled, { keyframes } from "styled-components";
import { Base } from "../../themes";

const loadingAnimation = keyframes`
 0% {
    transform: translateX(-50%);
  }

  100% {
    transform: translateX(300%);
  }
`;

const StyledProgressBar = styled.div<{ percent: number }>`
  position: relative;
  width: 100%;
  height: 4px;
  overflow: hidden;
  border-radius: 3px;
  background-color: ${(props) => props.theme.progressBar.backgroundColor};

  .progress-bar_full-text {
    display: block;
    position: absolute;
    margin-top: 8px;
  }

  .progress-bar_percent {
    float: left;
    overflow: hidden;
    max-height: 4px;
    min-height: 4px;
    transition: width 0.6s ease;
    border-radius: 3px;
    width: ${(props) => props.percent}%;
    background: ${(props) => props.theme.progressBar.percent.background};
  }

  .progress-bar_animation {
    position: absolute;
    height: 100%;
    width: 25%;
    border-radius: 3px;
    background: ${(props) => props.theme.progressBar.percent.background};
    animation: ${loadingAnimation} 2s linear infinite;
  }
`;

StyledProgressBar.defaultProps = { theme: Base };

export default StyledProgressBar;
