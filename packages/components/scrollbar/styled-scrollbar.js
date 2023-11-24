import Scrollbar from "react-scrollbars-custom";
import styled from "styled-components";
import Base from "../themes/base";

const StyledScrollbar = styled(Scrollbar)`
  .scroll-body {
    position: relative;
  }

  .track {
    box-sizing: border-box;
    display: flex;
    padding: 4px;
    border-radius: 8px !important;

    &:hover {
      .thumb-vertical {
        width: 8px !important;
      }

      .thumb-horizontal {
        height: 8px !important;
      }
    }
  }

  .track-vertical {
    direction: ${({ theme }) => theme.interfaceDirection};
    height: 100% !important;
    width: 16px !important;
    top: 0 !important;
    justify-content: flex-end;
  }

  .track-horizontal {
    width: 100% !important;
    height: 16px !important;
    align-items: flex-end;

    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `left: unset !important; right: 0 !important;`
        : `left: 0 !important;`}
  }

  &.trackYVisible.trackXVisible {
    .track-vertical {
      height: calc(100% - 16px) !important;
    }

    .track-horizontal {
      width: calc(100% - 16px) !important;
    }
  }

  .thumb {
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

  .thumb-vertical {
    width: ${({ $fixedSize }) => ($fixedSize ? "8px" : "4px")} !important;
    transition: width linear 0.1s;

    &:active {
      width: 8px !important;
    }
  }

  .thumb-horizontal {
    height: ${({ $fixedSize }) => ($fixedSize ? "8px" : "4px")} !important;
    transition: height linear 0.1s;

    &:active {
      height: 8px !important;
    }
  }
`;

StyledScrollbar.defaultProps = {
  theme: Base,
};

export default StyledScrollbar;
