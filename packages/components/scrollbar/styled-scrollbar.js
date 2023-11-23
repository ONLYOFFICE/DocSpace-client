import Scrollbar from "react-scrollbars-custom";
import styled from "styled-components";
import Base from "../themes/base";

const StyledScrollbar = styled(Scrollbar)`
  .scroll-body {
    position: relative;
  }
  .nav-thumb-vertical,
  .nav-thumb-horizontal {
    background-color: ${(props) =>
      props.color ? props.color : props.theme.scrollbar.bgColor} !important;
    z-index: 201;
    position: relative;

    :hover {
      background-color: ${(props) =>
        props.theme.scrollbar.hoverBgColor} !important;
    }

    :active,
    &.dragging {
      background-color: ${(props) =>
        props.theme.scrollbar.pressBgColor} !important;
    }
  }
`;

StyledScrollbar.defaultProps = {
  theme: Base,
};

export default StyledScrollbar;
