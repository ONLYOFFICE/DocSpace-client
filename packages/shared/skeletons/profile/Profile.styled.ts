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

import styled from "styled-components";

import { tablet, getCorrectFourValuesStyle } from "@docspace/shared/utils";

export const StyledWrapper = styled.div`
  width: 660px;
  display: flex;
  flex-direction: column;
  gap: 40px;

  @media ${tablet} {
    width: 100%;
  }
`;

export const MainBlock = styled.div`
  display: flex;
  gap: 40px;
  padding: 24px;
  border-radius: 12px;
  background: linear-gradient(
      270deg,
      rgba(0, 0, 0, 0) 23.13%,
      rgba(0, 0, 0, 0.07) 50.52%,
      rgba(0, 0, 0, 0) 78.12%
    ),
    rgba(0, 0, 0, 0.05);

  .avatar {
    width: 124px;
    height: 124px;
  }

  .combos {
    display: flex;
    gap: 16px;
    flex-direction: column;

    .row {
      display: grid;
      gap: 16px;
      grid-template-columns: 75px 1fr;
    }
  }
`;

export const LoginBlock = styled.div`
  display: flex;
  gap: 16px;
  flex-direction: column;

  .title {
    margin-bottom: 4px;
  }

  .actions {
    display: flex;
    gap: 16px;
    align-items: center;
  }
`;

export const SocialBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  .row {
    display: flex;
    gap: 20px;

    .button {
      width: 320px;

      @media ${tablet} {
        width: 100%;
      }
    }
  }
`;

export const SubBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  .toggle {
    display: flex;
    gap: 12px;
    align-items: center;
  }
`;

export const ThemeBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  .checkbox {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 4px;

    .row {
      display: flex;
      gap: 7px;
      align-items: center;
    }

    .description {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl"
          ? `padding-right: 23px;`
          : `padding-left: 23px;`}
    }
  }

  .themes-wrapper {
    display: flex;
    gap: 20px;

    .theme {
      width: 320px;

      @media ${tablet} {
        width: 100%;
      }
    }
  }
`;

export const MobileView = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 8px;
  padding: 0 16px;
  margin: ${({ theme }) =>
    getCorrectFourValuesStyle("0 0 0 -20px", theme.interfaceDirection)};

  .avatar {
    height: 124px;
    width: 124px;
    margin-bottom: 24px;
    align-self: center;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .block {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 32px;
  }

  .notifications {
    .title {
      padding-bottom: 10px;
    }
    margin-bottom: 32px;
  }

  .theme {
    .theme-title {
      padding-bottom: 12px;
    }

    .flex {
      display: flex;
    }

    .check-box {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl"
          ? `padding-left: 7px;`
          : `padding-right: 7px;`}
    }

    .theme-selection {
      display: flex;
      flex-direction: column;
      padding-top: 4px;

      ${({ theme }) =>
        theme.interfaceDirection === "rtl"
          ? `padding-right: 22px;`
          : `padding-left: 22px;`}

      .theme-description {
        padding-bottom: 12px;
      }

      .check-box {
        width: 16px;
        height: 16px;
      }

      .check-box-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
    }
  }
`;

export const FooterBlock = styled.div`
  .header {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-bottom: 14px;
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    max-width: 787px;
    padding-bottom: 26px;
  }
`;
