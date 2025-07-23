// (c) Copyright Ascensio System SIA 2009-2025
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
import { mobile, tablet } from "@docspace/shared/utils";
import { zIndex } from "@docspace/shared/themes";

import { Text } from "@docspace/shared/components/text";

export const getDropdownHoverRules = () => [
  `.drop-down-item:hover:not(.separator) {
    background-color: var(--drop-down-item-hover-color) !important;
  }`,
  `.drop-down-item.activeDescendant {
    background-color: var(--drop-down-item-hover-color) !important;
  }`,
];

export const StyledWrapper = styled.div`
  width: 100%;
  max-width: 660px;

  display: flex;
  padding: 24px 24px 18px;
  gap: 40px;
  background: ${(props) => props.theme.profile.main.background};
  border-radius: 12px;

  box-sizing: border-box;

  .avatar {
    min-width: 124px;
  }

  @media ${tablet} {
    max-width: 100%;
  }

  @media ${mobile} {
    background: none;
    flex-direction: column;
    gap: 24px;
    align-items: center;
    padding: 0;
  }
`;

export const StyledAvatarWrapper = styled.div`
  display: flex;

  @media ${mobile} {
    width: 100%;
    justify-content: center;
  }

  .badges-wrapper {
    display: none;

    @media ${mobile} {
      display: flex;
      position: absolute;
      inset-inline-end: 16px;
    }
  }
`;

export const StyledInfo = styled.div`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding-top: 5px;

  @media ${tablet} {
    gap: 7px;
  }

  .rows-container {
    display: grid;
    grid-template-columns: minmax(75px, auto) minmax(0, 1fr);
    gap: 24px;
    row-gap: 16px;
    max-width: 100%;

    .profile-block-field {
      display: flex;
      gap: 8px;
      height: 20px;
      align-items: center;
      line-height: 20px;
    }

    .sso-badge,
    .ldap-badge {
      margin-inline-start: 4px;
    }

    .email-container {
      .send-again-desktop {
        display: flex;
      }
    }
    .user-type-container {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    .language-combo-box-wrapper {
      display: flex;
      height: 28px;
      align-items: center;
      gap: 8px;

      margin-inline-start: -8px;

      .language-combo-box .combo-button {
        padding-inline: 8px 0;
      }
    }
  }

  .mobile-profile-block {
    display: none;
  }

  .edit-button {
    min-width: 12px;

    svg path {
      fill: ${(props) => props.theme.profile.main.iconFill};
    }
  }

  .email-edit-container {
    display: flex;
    align-items: center;
    padding-inline-end: 16px;
    line-height: 20px;

    .email-text-container {
      ${(props) =>
        props.withActivationBar &&
        css`
          color: ${props.theme.profile.main.pendingEmailTextColor};
        `}
    }

    .email-edit-button {
      display: block;
      padding-inline-start: 8px;
    }
  }

  .send-again-container {
    display: flex;
    flex-grow: 1;
    max-width: 50%;
    cursor: pointer;
    align-items: center;
    cursor: pointer;
    height: 18px;

    .send-again-text {
      margin-inline-start: 5px;
      line-height: 15px;
      color: ${(props) => props.currentColorScheme.main?.accent};
      border-bottom: 1px solid
        ${(props) => props.currentColorScheme.main?.accent};
      margin-top: 2px;
    }

    .send-again-icon {
      display: block;
      width: 12px;
      height: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      div {
        width: 12px;
        height: 12px;
      }

      svg {
        width: 12px;
        height: 12px;

        path {
          fill: ${(props) => props.currentColorScheme.main?.accent};
        }
      }
    }
  }

  .profile-language {
    display: flex;
  }

  @media ${mobile} {
    .rows-container {
      display: none;
    }

    .mobile-profile-block {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 100%;

      .mobile-profile-row {
        gap: 8px;
        background: ${(props) => props.theme.profile.main.mobileRowBackground};
        padding: 12px 16px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        line-height: 20px;
        max-width: 100%;

        .mobile-profile-field {
          display: flex;
          align-items: ${({ theme }) =>
            theme.interfaceDirection === "rtl" ? `flex-start` : `baseline`};
          max-width: calc(100% - 28px);
          flex-direction: column;
          gap: 2px;
        }

        .mobile-profile-label {
          min-width: 100%;
          max-width: 100%;
          font-size: 12px !important;
          line-height: 16px !important;
          white-space: nowrap;
          color: ${(props) => props.theme.profile.main.mobileLabel};
        }

        .mobile-profile-label-field {
          padding-inline-start: 0;
          max-width: 100%;
          font-size: 12px !important;
          line-height: 16px;
        }

        .email-container {
          padding-inline-start: 0;

          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
        }

        .edit-button {
          margin-inline-start: auto;
          min-width: 12px;

          svg path {
            fill: ${(props) => props.theme.profile.main.iconFill};
          }
        }

        .mobile-profile-password {
          max-width: 100%;
          font-size: 12px !important;
          line-height: 16px !important;
        }
      }

      .mobile-language {
        display: flex;
        width: 100%;
        flex-direction: column;
        gap: 4px;

        @media ${mobile} {
          margin-top: 8px;
        }

        &__wrapper-combo-box {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mobile-profile-label {
          display: flex;
          align-items: center;
          gap: 4px;
          min-width: 75px;
          max-width: 75px;
          white-space: nowrap;
        }

        .backdrop-active {
          z-index: ${zIndex.backdrop} !important;
        }
      }

      @media ${mobile} {
        gap: 8px;
      }
    }
  }
`;

export const StyledLabel = styled(Text)`
  display: block;
  align-items: center;
  gap: 4px;

  min-width: 100%;
  width: 100%;
  line-height: 20px;
  white-space: nowrap;
  color: ${(props) => props.theme.profile.main.descriptionTextColor};

  overflow: hidden;
  text-overflow: ellipsis;

  margin-top: ${({ marginTopProp }) => marginTopProp || 0};
`;
