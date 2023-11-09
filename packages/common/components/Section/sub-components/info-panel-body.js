import { useRef } from "react";
import Scrollbar from "@docspace/components/scrollbar";
import { isMobileOnly } from "react-device-detect";
import React from "react";
import styled, { css } from "styled-components";

const StyledScrollbar = styled(Scrollbar)`
  ${({ $isScrollLocked }) =>
    $isScrollLocked &&
    css`
      & .scroll-wrapper > .scroller {
        overflow: hidden !important;
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                margin-left: -1px !important;
              `
            : css`
                margin-right: -1px !important;
              `}
      }
      ${isMobileOnly &&
      css`
        & .scroll-wrapper > .scroller {
          ${(props) =>
            props.theme.interfaceDirection === "rtl"
              ? css`
                  padding-left: 20px !important;
                  margin-left: -21px !important;
                `
              : css`
                  padding-right: 20px !important;
                  margin-right: -21px !important;
                `}
        }
      `}
    `}
`;

const SubInfoPanelBody = ({ children, isInfoPanelScrollLocked }) => {
  const content = children?.props?.children;
  const scrollRef = useRef(null);
  const scrollYPossible = scrollRef?.current?.scrollValues?.scrollYPossible;
  const scrollLocked = scrollYPossible && isInfoPanelScrollLocked;

  return (
    <StyledScrollbar
      ref={scrollRef}
      $isScrollLocked={scrollLocked}
      noScrollY={scrollLocked}
      scrollclass="section-scroll info-panel-scroll"
      stype="mediumBlack"
    >
      {content}
    </StyledScrollbar>
  );
};

SubInfoPanelBody.displayName = "SubInfoPanelBody";

export default SubInfoPanelBody;
