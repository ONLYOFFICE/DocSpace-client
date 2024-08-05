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
import { Base } from "../../themes";
import { tablet, mobile } from "../../utils";

const StyledPaging = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;

  .prev-button,
  .next-button {
    font-size: 13px;
    line-height: 20px;
    padding: 6px 28px;
  }

  .prev-button {
    max-width: 111px;
  }

  .next-button {
    max-width: 86px;
  }

  @media ${tablet} {
    .prev-button,
    .next-button {
      font-size: 14px;
    }

    .prev-button {
      max-width: 115px;
      height: 40px;
    }

    .next-button {
      max-width: 89px;
      height: 40px;
    }
  }

  & > button {
    margin-inline-end: ${({ theme }) => theme.paging.button.marginRight};
  }
`;
StyledPaging.defaultProps = { theme: Base };

const StyledOnPage = styled.div`
  width: 125px;

  @media ${tablet} {
    width: 125px;
    height: 40px;
  }

  margin-inline-start: ${({ theme }) => theme.paging.comboBox.marginLeft};
  margin-inline-end: ${({ theme }) => theme.paging.comboBox.marginRight};

  .hideDisabled {
    padding: 0;

    @media ${tablet} {
      .combo-button-label {
        font-size: 14px;
      }
    }

    .combo-button {
      padding-inline-start: 14px;

      .combo-button-label {
        margin-inline-end: 0;
      }

      .combo-buttons_arrow-icon {
        margin-inline-end: 4px;
      }

      @media ${tablet} {
        height: 40px;
      }
    }

    div[disabled] {
      display: none;
    }
  }

  @media ${mobile} {
    display: none;
  }
`;
StyledOnPage.defaultProps = { theme: Base };

const StyledPage = styled.div`
  width: 83px;
  margin-inline-end: ${({ theme }) => theme.paging.page.marginRight};

  .manualWidth {
    padding: 0;

    @media ${tablet} {
      .combo-button-label {
        font-size: 14px;
      }
    }

    .combo-button {
      padding-inline-start: 14px;

      .combo-button-label {
        margin-inline-end: 0;
      }

      .combo-buttons_arrow-icon {
        margin-inline-end: 4px;
      }

      @media ${tablet} {
        height: 40px;
      }
    }

    .dropdown-container {
      width: ${(props) => props.theme.paging.page.width};
    }
  }
`;
StyledPage.defaultProps = { theme: Base };

export { StyledPage, StyledOnPage, StyledPaging };
