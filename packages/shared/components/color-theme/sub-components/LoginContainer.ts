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

"use client";

import styled from "styled-components";
import { tablet, mobile } from "../../../utils";
import { Base } from "../../../themes";

const LoginContainer = styled.div<{
  type: string;
  isRegisterContainerVisible: boolean;
}>`
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 960px;
  z-index: 0;

  margin-top: 56px;
  margin-bottom: ${(props) =>
    props.isRegisterContainerVisible ? "100px" : "56px"};

  .remember-wrapper {
    max-width: 170px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .buttonWrapper {
    margin-bottom: 8px;
    width: 100%;
  }

  @media ${tablet} {
    max-width: 480px;
  }

  @media ${mobile} {
    margin-inline: auto;
    max-width: 100%;
    width: calc(100% - 24px);
    padding-inline: 16px 8px;

    margin: 0 auto;
  }

  .socialButton {
    min-height: 40px;
  }

  .or-label,
  .login-or-access-text {
    min-height: 18px;
  }

  .login-or-access-text {
    text-transform: lowercase;
    color: ${(props) => props.theme.login.orTextColor};
  }

  .recover-link {
    min-height: 19px;
    margin-top: 20px;
  }

  .greeting-title {
    width: 100%;
    max-width: 480px;
    padding-bottom: 32px;
    min-height: 32px;
    color: ${(props) => props.theme.login.headerColor};

    @media ${mobile} {
      padding-top: 34px;
    }
  }

  .more-label {
    padding-top: 18px;
  }

  .or-label {
    color: ${(props) => props.theme.login.orTextColor};
    margin: 0 8px;
  }

  .line {
    display: flex;
    width: 100%;
    align-items: center;
    color: ${(props) => props.theme.login.orLineColor};
    padding: 32px 0;

    @media ${mobile} {
      padding: 24px 0;
    }
  }

  .line:before,
  .line:after {
    content: "";
    flex-grow: 1;
    background: ${(props) => props.theme.login.orLineColor};
    height: 1px;
    font-size: 0px;
    line-height: 0px;
    margin: 0px;
  }

  .code-input-container {
    margin-top: 32px;
    text-align: center;
  }

  .not-found-code {
    margin-top: 32px;
  }

  .auth-form-container {
    width: 100%;

    .field-body {
      input,
      .password-input > div {
        background: ${(props) => props.theme.input.backgroundColor};
        color: ${(props) => props.theme.input.color};
        //border-color: ${(props) => props.theme.input.borderColor};
      }
    }

    .login-forgot-wrapper {
      margin-bottom: 14px;
      .login-checkbox-wrapper {
        display: flex;
        //align-items: center;

        .login-checkbox {
          display: flex;
          align-items: flex-start;

          svg {
            margin-inline-end: 8px !important;
            rect {
              fill: ${(props) => props.theme.checkbox.fillColor};
              stroke: ${(props) => props.theme.checkbox.borderColor};
            }

            path {
              fill: ${(props) => props.theme.checkbox.arrowColor};
            }
          }

          .help-button {
            svg {
              path {
                fill: ${(props) => props.theme.login.helpButton};
              }
            }
          }

          .checkbox-text {
            color: ${(props) => props.theme.checkbox.arrowColor};
          }

          label {
            justify-content: center;
          }
        }

        .remember-helper-wrapper {
          display: flex;
          gap: 4px;
        }
      }

      .login-link {
        line-height: 18px;
        margin-inline-start: auto;
      }
    }

    .login-button {
      margin-top: 8px;
    }

    .login-button-dialog {
      margin-inline-end: 8px;
    }

    .login-bottom-border {
      width: 100%;
      height: 1px;
      background: ${(props) => props.theme.login.orLineColor};
    }

    .login-bottom-text {
      margin: 0 8px;
    }

    /* .login-or-access {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;

      & > :first-child {
        margin-top: 24px;
      }
    } */
  }

  .logo-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 386px;
    height: ${(props) => (props.type === "invitation" ? "26.56px" : "44px")};
    padding-bottom: ${(props) =>
      props.type === "invitation" ? "16px" : "40px"};

    svg {
      path:last-child {
        fill: ${(props) => props.theme.client.home.logoColor};
      }
    }

    @media ${mobile} {
      display: none;
    }
  }

  .workspace-title {
    color: ${(props) => props.theme.login.titleColor};
    margin-bottom: 16px;

    @media ${mobile} {
      margin-top: 32px;
    }
  }

  .code-description {
    color: ${(props) => props.theme.login.textColor};
  }
`;

LoginContainer.defaultProps = { theme: Base };

export default LoginContainer;
