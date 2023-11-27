import styled from "styled-components";
import Base from "../themes/base";

const StyledProgressBar = styled.div`
  position: relative;
  height: 4px;
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
    // @ts-expect-error TS(2339): Property 'percent' does not exist on type 'ThemedS... Remove this comment to see the full error message
    width: ${(props) => props.percent}%;
    background: ${(props) => props.theme.progressBar.percent.background};
  }
`;

StyledProgressBar.defaultProps = { theme: Base };

export default StyledProgressBar;
