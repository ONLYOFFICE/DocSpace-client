import styled from "styled-components";
import Base from "../themes/base";

const StyledTooltip = styled.div`
  .__react_component_tooltip {
    background-color: ${(props) =>
      props.color ? props.color : props.theme.tooltip.color};
    border-radius: ${(props) => props.theme.tooltip.borderRadius};
    -moz-border-radius: ${(props) => props.theme.tooltip.borderRadius};
    -webkit-border-radius: ${(props) => props.theme.tooltip.borderRadius};
    box-shadow: ${(props) => props.theme.tooltip.boxShadow};
    -moz-box-shadow: ${(props) => props.theme.tooltip.boxShadow};
    -webkit-box-shadow: ${(props) => props.theme.tooltip.boxShadow};
    padding: ${(props) => props.theme.tooltip.padding};
    max-width: ${(props) =>
      `min(100vw, ${
        props.maxWidth ? props.maxWidth : props.theme.tooltip.maxWidth
      })`};
    color: ${(props) => props.theme.tooltip.textColor};
    z-index: 999;

    box-sizing: border-box;

    p,
    div,
    span {
      color: ${(props) => props.theme.tooltip.textColor};
    }

    &:before {
      border: ${(props) => props.theme.tooltip.before.border};
    }
    &:after {
      border: ${(props) => props.theme.tooltip.after.border};
      background-color: ${(props) =>
        props.color ? props.color : props.theme.tooltip.color} !important;
    }
  }

  .__react_component_tooltip.place-left::after {
    border-left: none !important;
  }

  .__react_component_tooltip.place-right::after {
    border-right: none !important;
  }

  .__react_component_tooltip.place-top::after {
    border-top: none !important;
  }

  .__react_component_tooltip.place-bottom::after {
    border-bottom: none !important;
  }

  .__react_component_tooltip.place-left::before {
    background: none !important;
  }

  .__react_component_tooltip.place-right::before {
    background: none !important;
  }

  .__react_component_tooltip.place-top::before {
    background: none !important;
  }

  .__react_component_tooltip.place-bottom::before {
    background: none !important;
  }

  .__react_component_tooltip.place-bottom::after,
  .__react_component_tooltip.place-top::after,
  .__react_component_tooltip.place-right::after,
  .__react_component_tooltip.place-left::after {
    display: none;
  }
`;

StyledTooltip.defaultProps = {
  theme: Base,
};

export default StyledTooltip;
