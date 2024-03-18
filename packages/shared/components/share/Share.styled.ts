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

import styled from "styled-components";

const StyledLinks = styled.div`
  margin-top: 20px;

  .title-link {
    margin-bottom: 12px;
    line-height: 16px;
    color: #a3a9ae;
  }

  .additional-link {
    display: flex;
    justify-content: space-between;
    gap: 10px;

    .link-to-viewing-icon {
      svg {
        weight: 16px;
        height: 16px;
      }
    }
  }
`;

const StyledLinkRow = styled.div`
  padding: 8px 0;
  display: flex;
  gap: 8px;
  align-items: center;

  .combo-box {
    padding: 0;
  }

  .combo-button {
    padding-left: 8px;
  }

  .link-options {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .internal-combobox {
    padding: 0px;
  }

  .expired-options {
    padding: 0px;

    & > span > a {
      padding: 0px !important;
    }
  }

  .expire-text {
    margin-left: 8px;
  }

  .link-actions {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-left: auto;
  }

  .loader {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: ${(props) => props.theme.avatar.imageContainer.borderRadius};
    background-color: ${(props) => props.theme.avatar.icon.background};
    height: 32px;
    width: 32px;
  }
`;

const StyledSquare = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  padding: 10px;
  background: ${(props) => props.theme.avatar.icon.background};
`;

export { StyledLinks, StyledLinkRow, StyledSquare };
