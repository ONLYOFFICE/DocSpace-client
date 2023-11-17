import styled, { css } from "styled-components";

import DesktopDetails from "../DesktopDetails";
import ImageViewerToolbar from "../ImageViewerToolbar";

type Panel = { isPanelOpen?: boolean };

export const PDFViewerToolbarWrapper = styled.section`
  @media (hover: hover) {
    .pdf-viewer_page-count:hover + .pdf-viewer_toolbar {
      background: rgba(0, 0, 0, 0.8);
    }
    &:hover .pdf-viewer_page-count {
      background: rgba(0, 0, 0, 0.8);
    }
  }
`;

export const PDFViewerWrapper = styled.div`
  position: fixed;
  z-index: 305;
  inset: 0;

  display: flex;
  flex-direction: ${({ theme }) =>
    theme.interfaceDirection === "rtl" ? `row-reverse` : `row`};

  background: rgba(55, 55, 55, 0.6);

  #mainPanel {
    width: 100%;
    height: 100%;

    position: relative;
  }
  #id_viewer {
    background: none !important;
    ${({ theme }) =>
      theme.interfaceDirection === "rtl" &&
      css`
        left: unset !important;
        right: 0 !important;
      `}
  }
  .block_elem {
    position: absolute;
    padding: 0;
    margin: 0;
  }
  #id_vertical_scroll {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl" && "left: 0 !important;"}
  }
`;

export const ErrorMessageWrapper = styled.section`
  position: fixed;
  z-index: 305;
  inset: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  background: rgba(55, 55, 55, 0.6);
`;

export const ErrorMessage = styled.p`
  padding: 20px 30px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 4px;
  color: rgb(238, 238, 238);
`;

export const DesktopTopBar = styled(DesktopDetails)<Panel>`
  display: flex;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          right: ${props.isPanelOpen ? "306px" : 0};
        `
      : css`
          left: ${props.isPanelOpen ? "306px" : 0};
        `}
  width: ${(props) => (props.isPanelOpen ? "calc(100%  - 306px)" : "100%")};

  .mediaPlayerClose {
    position: fixed;
    top: 13px;
    ${({ theme }) =>
      theme.interfaceDirection === "rtl" ? `left: 12px;` : `right: 12px;`}
    height: 17px;
    &:hover {
      background-color: transparent;
    }
    svg {
      path {
        fill: ${(props) => props.theme.mediaViewer.iconColor};
      }
    }
  }

  .title {
    padding-right: 16px;
  }
`;

export const PDFToolbar = styled(ImageViewerToolbar)<Panel>`
  left: ${({ theme, isPanelOpen }) => {
    const value = isPanelOpen ? 306 / 2 : 0;
    const operator = theme.interfaceDirection === "rtl" ? "-" : "+";

    return `calc(50% ${operator} ${value}px)`;
  }};

  .panelToggle {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl" && `transform: scaleX(-1);`}
  }

  transition: background 0.26s ease-out 0s;
`;
