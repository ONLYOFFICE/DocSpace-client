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
import { injectDefaultTheme } from "@docspace/shared/utils";
import { zIndex } from "@docspace/shared/themes";

export const TemplateAccess = styled.div.attrs(injectDefaultTheme)`
  .template-access_description {
    margin-bottom: 8px;
  }

  .template-access_wrapper {
    display: flex;
    align-items: center;
    margin-top: 12px;

    .template-access_link {
      margin-inline-start: auto;
    }
  }

  .template-access_avatar-container {
    display: flex;
    align-items: center;
    gap: 8px;

    .access-avatar-container {
      display: flex;

      .template-access_avatar:not(:first-child) {
        margin-inline-start: -8px;
        z-index: ${zIndex.content};
      }

      .template-access_avatar:last-child {
        z-index: ${zIndex.base};
      }

      .template-access_avatar {
        border: ${(props) => `1px solid ${props.theme.backgroundColor}`};
        border-radius: 50%;
        z-index: ${zIndex.sticky};

        min-width: 32px;
      }
    }
  }

  .template-access_label {
    margin-bottom: 8px;
  }

  .template-access_display-name {
    display: flex;
    align-items: center;
    gap: 4px;

    .me-label {
      color: ${({ theme }) => theme.text.disableColor};
    }
  }
`;
