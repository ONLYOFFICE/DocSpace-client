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

import { mobile } from "@docspace/shared/utils";

const StyledSMTPContent = styled.div`
  .rectangle-loader_description {
    max-width: 700px;
    margin-bottom: 20px;
    margin-top: 16px;
  }
  .rectangle-loader_title {
    margin-bottom: 8px;
  }
  .rectangle-loader-2 {
    max-width: 350px;
    margin-bottom: 16px;
  }

  .rectangle-loader_checkbox {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;

    svg:first-child {
      margin-top: 2px;
    }
  }
  .rectangle-loader_buttons {
    margin-top: 20px;
    max-width: 404px;
    display: grid;
    grid-template-columns: 86px 1fr 1fr;
    gap: 8px;

    @media ${mobile} {
      grid-template-columns: 1fr;
    }
  }
`;
const StyledStorageManagementLoader = styled.div`
  max-width: 660px;

  svg {
    display: block;
  }
  .storage-loader_title {
    height: 40px;
    margin-bottom: 24px;

    @media ${mobile} {
      height: 68px;
    }
  }

  svg:last-child {
    max-width: 123px;
    @media ${mobile} {
      max-width: 100%;
    }
  }

  .storage-loader_grid {
    svg:nth-child(1) {
      max-width: 158px;
    }
    svg:nth-child(2) {
      max-width: 130px;
    }
    svg:nth-child(3) {
      max-width: 100px;
    }
    svg:nth-child(4) {
      max-width: 120px;
    }

    display: grid;
    grid-gap: 24px;
    grid-template-columns:
      minmax(50px, 158px) minmax(70px, 130px) minmax(40px, 100px)
      minmax(60px, 120px);

    @media ${mobile} {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(4, 20px);
      grid-gap: 8px;
      margin-bottom: 12px;
    }
  }

  div {
    svg {
      margin-bottom: 16px;
    }
  }
`;

export { StyledSMTPContent, StyledStorageManagementLoader };
