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

import { tablet, mobile } from "@docspace/shared/utils";
import Headline from "@docspace/shared/components/headline/Headline";
import { Base } from "@docspace/shared/themes";
import { Button } from "@docspace/shared/components/button";

const StyledContainer = styled.div`
  height: 69px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  display: grid;
  align-items: center;
  grid-template-columns: ${({ isInfoPanelVisible }) =>
    isInfoPanelVisible
      ? "29px min-content auto"
      : "29px min-content auto 52px"};

  .arrow-button {
    width: 17px;
    min-width: 17px;
    ${({ theme }) =>
      theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
  }

  @media ${tablet} {
    height: 69px;
    padding: 0;
    grid-template-columns: 29px min-content auto;
  }

  @media ${mobile} {
    height: 53px;
    padding: 0;
    display: flex;
  }
`;

const StyledHeading = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;

  ${({ isInfoPanelVisible }) =>
    isInfoPanelVisible &&
    css`
      max-width: calc(100vw - 320px - 440px);
    `};

  @media ${tablet} {
    width: 100%;
    max-width: calc(100vw - 320px);
  }

  @media ${mobile} {
    margin: ${({ theme }) =>
      theme.interfaceDirection === "rtl" ? "0 12px 0 0 " : "0 0 0 12px"};
    width: 100%;
    max-width: calc(100vw - 68px);
  }
`;

const StyledHeadline = styled(Headline)`
  width: 100%;
  max-width: min-content;
  font-weight: 700;
  font-size: ${(props) => props.theme.getCorrectFontSize("18px")};
  line-height: 24px;
  box-sizing: border-box;

  @media ${tablet} {
    font-size: ${(props) => props.theme.getCorrectFontSize("21px")};
    line-height: 28px;
  }

  @media ${mobile} {
    font-size: ${(props) => props.theme.getCorrectFontSize("18px")};
    line-height: 24px;
  }
`;

const StyledSubmitToGalleryButton = styled(Button)`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: auto;
        `
      : css`
          margin-left: auto;
        `}

  @media ${mobile} {
    display: none;
  }
`;
StyledSubmitToGalleryButton.defaultProps = { theme: Base };

const StyledInfoPanelToggleWrapper = styled.div`
  box-sizing: border-box;
  display: ${(props) => (props.isInfoPanelVisible ? "none" : "flex")};
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;

  margin: ${({ theme }) =>
    theme.interfaceDirection !== "rtl" ? "0 8px 0 28px" : "0 28px 0 8px"};

  @media ${tablet} {
    display: none;
  }

  .info-panel-toggle-bg {
    height: 16px;
    width: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin-bottom: 1px;

    background-color: ${(props) =>
      props.isInfoPanelVisible
        ? props.theme.infoPanel.sectionHeaderToggleBgActive
        : props.theme.infoPanel.sectionHeaderToggleBg};

    svg {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
    }

    path {
      fill: ${(props) =>
        props.isInfoPanelVisible
          ? props.theme.infoPanel.sectionHeaderToggleIconActive
          : props.theme.infoPanel.sectionHeaderToggleIcon};
    }
  }
`;
StyledInfoPanelToggleWrapper.defaultProps = { theme: Base };

export {
  StyledHeading,
  StyledHeadline,
  StyledContainer,
  StyledSubmitToGalleryButton,
  StyledInfoPanelToggleWrapper,
};
