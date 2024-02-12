import styled from "styled-components";
import { isIOS, isIOS13, isIPad13 } from "react-device-detect";

import { Scrollbar } from "./custom-scrollbar";

import { Base } from "../../themes";
import { mobile, desktop, tablet } from "../../utils";

const StyledScrollbar = styled(Scrollbar)<{ $fixedSize?: boolean }>`
  .scroller::-webkit-scrollbar {
    ${(isIOS || isIOS13 || isIPad13) && `display: none;`}
  }

  .scroll-body {
    padding-inline-end: 17px !important;
    position: relative;
    outline: none;
    tab-index: -1;

    @media ${mobile} {
      padding-inline-end: 8px !important;
    }
  }

  .track {
    box-sizing: border-box;
    display: flex;
    padding: 4px;
    border-radius: 8px !important;
    background: transparent !important;

    @media ${desktop} {
      &:hover {
        .thumb-vertical {
          width: 8px !important;
        }

        .thumb-horizontal {
          height: 8px !important;
        }
      }
    }

    @media ${tablet} {
      pointer-events: none;

      .thumb {
        pointer-events: all;
      }
    }
  }

  .track-vertical {
    direction: ${({ theme }) => theme.interfaceDirection};
    height: ${({ noScrollY }) => (noScrollY ? 0 : "100%")} !important;
    width: 16px !important;
    top: 0 !important;
    justify-content: flex-end;
  }

  .track-horizontal {
    width: 100% !important;
    height: 16px !important;
    align-items: flex-end;
    direction: ltr;

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
    touch-action: none;
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
      touch-action: none;
      background-color: ${(props) =>
        props.theme.scrollbar.pressBgColor} !important;
    }
  }

  .thumb-vertical {
    width: ${({ $fixedSize }) => ($fixedSize ? "8px" : "4px")} !important;
    transition: width linear 0.1s;

    @media ${desktop} {
      &:active {
        width: 8px !important;
      }
    }

    @media ${tablet} {
      width: 4px !important;
    }
  }

  .thumb-horizontal {
    height: ${({ $fixedSize }) => ($fixedSize ? "8px" : "4px")} !important;
    transition: height linear 0.1s;

    @media ${desktop} {
      &:active {
        height: 8px !important;
      }
    }

    @media ${tablet} {
      height: 4px !important;
    }
  }
`;

StyledScrollbar.defaultProps = {
  theme: Base,
};

export default StyledScrollbar;
