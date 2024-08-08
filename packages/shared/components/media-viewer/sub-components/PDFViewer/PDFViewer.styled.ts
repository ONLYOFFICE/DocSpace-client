// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import styled, { css } from "styled-components";

import { DesktopDetails } from "../DesktopDetails";
import { ViewerToolbar } from "../ViewerToolbar";
import { globalColors } from "../../../../themes";

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

    // doesn't require mirroring for LTR
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
    // doesn't require mirroring for LTR
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
  color: ${globalColors.white};
`;

export const DesktopTopBar = styled(DesktopDetails)<Panel>`
  display: flex;
  inset-inline-start: ${(props) => (props.isPanelOpen ? "306px" : 0)};
  width: ${(props) => (props.isPanelOpen ? "calc(100%  - 306px)" : "100%")};

  .mediaPlayerClose {
    position: fixed;
    top: 13px;
    inset-inline-end: 12px;
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
    padding-inline-end: 16px;
  }
`;

export const PDFToolbar = styled(ViewerToolbar)<Panel>`
  // logical property won't work correctly
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
