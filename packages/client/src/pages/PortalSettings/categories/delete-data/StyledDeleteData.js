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
import { mobile } from "@docspace/shared/utils";

export const DeleteDataLayout = styled.div`
  width: 100%;

  hr {
    margin: 24px 0;
    border: none;
    border-top: ${(props) => props.theme.client.settings.deleteData.borderTop};
  }
`;

export const MainContainer = styled.div`
  max-width: 700px;
  white-space: pre-line;

  .description {
    margin-bottom: 16px;
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
  }

  .helper {
    line-height: 20px;
    margin-bottom: 24px;
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
  }
`;

export const ButtonWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  .request-again-link {
    margin-inline-start: 4px;
  }

  @media ${mobile} {
    flex-direction: column-reverse;
    gap: 16px;
    position: absolute;
    bottom: 16px;
    width: calc(100% - 40px);

    @media ${mobile} {
      width: calc(100% - 32px);
    }

    .button {
      width: 100%;
    }
  }
`;
