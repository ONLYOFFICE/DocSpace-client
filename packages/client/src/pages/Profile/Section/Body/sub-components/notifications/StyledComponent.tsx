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

import styled from "styled-components";

import { tablet } from "@docspace/shared/utils";

const StyledSectionBodyContent = styled.div`
  width: 100%;
  max-width: 660px;

  @media ${tablet} {
    max-width: 100%;
  }

  .notification-container {
    display: flex;
    flex-direction: column;

    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      div > label {
        position: relative;
        gap: 0;
      }
    }
    margin-bottom: 12px;

    .notification-container_description {
      color: ${(props) =>
        props.theme.profile.notifications.textDescriptionColor};
    }
  }

  .badges-container {
    margin-bottom: 24px;
    p {
      line-height: 20px;
    }
  }
`;

const StyledTextContent = styled.div`
  margin-bottom: 12px;
  border-bottom: ${(props) => props.theme.filesPanels.sharing.borderBottom};

  p {
    line-height: 16px;
    padding-bottom: 8px;
  }

  .email-title {
    padding-top: 2px;
  }
`;

const StyledSectionHeader = styled.div`
  display: flex;
  align-items: center;
  .arrow-button {
    margin-inline-end: 16px;
    ${({ theme }) =>
      theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
`;

export { StyledTextContent, StyledSectionBodyContent, StyledSectionHeader };
