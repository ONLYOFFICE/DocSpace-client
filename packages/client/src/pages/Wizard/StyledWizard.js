// (c) Copyright Ascensio System SIA 2010-2024
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
import { isIOS, isFirefox } from "react-device-detect";
import BackgroundPatternReactSvgUrl from "PUBLIC_DIR/images/background.pattern.react.svg?url";

export const Wrapper = styled.div`
  height: ${isIOS && !isFirefox ? "calc(var(--vh, 1vh) * 100)" : "100vh"};
  width: 100vw;
  z-index: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  @media ${mobile} {
    height: auto;
    min-height: 100%;
    width: 100%;
    min-width: 100%;
  }

  .bg-cover {
    background-image: url("${BackgroundPatternReactSvgUrl}");
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-size: cover;
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    z-index: -1;

    @media ${mobile} {
      background-image: none;
    }
  }
`;

export const StyledContent = styled.div`
  min-height: 100vh;
  flex: 1 0 auto;
  flex-direction: column;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;

  @media ${mobile} {
    min-height: 100%;
    width: calc(100% - 32px);
    justify-content: start;
  }
`;

export const WizardContainer = styled.div`
  margin: 56px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  @media ${tablet} {
    width: 100%;
    max-width: 480px;
  }

  @media ${mobile} {
    max-width: 100%;
    margin: 32px auto;
  }

  .docspace-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 40px;
  }

  .welcome-text {
    padding-bottom: 32px;

    @media ${mobile} {
      max-width: 343px;
    }
  }

  .form-header {
    padding-bottom: 24px;
  }

  .password-field-wrapper {
    width: 100%;
  }

  .wizard-field {
    width: 100%;
  }

  .password-field {
    margin: 0px !important;
  }

  .license-filed {
    width: 100%;
    margin-bottom: 20px;
  }
`;

export const StyledLink = styled.div`
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: center;
  padding-bottom: 16px;
  padding-top: 8px;

  .generate-password-link {
    color: ${(props) => props.theme.client.wizard.generatePasswordColor};
  }

  .icon-button_svg {
    svg > g > path {
      fill: ${(props) => props.theme.client.wizard.generatePasswordColor};
    }
  }
`;

export const StyledInfo = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 59px 1fr;
  align-items: center;
  gap: 16px;

  margin-bottom: 4px;

  .machine-name {
    padding-bottom: 4px;
    padding-top: 4px;
    padding-left: 8px;
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `padding-right: 8px;`
        : `padding-left: 8px;`}
    line-height: 20px;
  }

  .combo-button {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `padding-right: 8px;`
        : `padding-left: 8px;`}
  }

  .wrapper__language-selector {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .combo-button-label {
    max-width: 220px;

    @media ${tablet} {
      max-width: 300px;
    }

    @media ${mobile} {
      max-width: 220px;
    }
  }
`;

export const StyledAcceptTerms = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.3em;
  padding-top: 20px;
  padding-bottom: 24px;

  .wizard-checkbox svg {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-left: 8px;`
        : `margin-right: 8px;`}
  }
`;
