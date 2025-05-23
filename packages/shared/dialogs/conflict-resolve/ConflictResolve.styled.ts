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

import { globalColors } from "../../themes";

const StyledBodyContent = styled.div`
  display: contents;

  .radio {
    padding-bottom: 8px;
  }

  .message {
    margin-bottom: 16px;

    .bold {
      font-weight: 600;
    }

    .truncate {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  .select-action {
    margin-bottom: 12px;
  }

  .conflict-resolve-radio-button {
    label {
      display: flex;
      align-items: flex-start;
      &:not(:last-child) {
        margin-bottom: 12px;
      }
    }

    svg {
      overflow: visible;
      margin-inline-end: 8px;
      margin-top: 3px;
    }

    .radio-option-title {
      font-weight: 600;
      font-size: 14px;
      line-height: 16px;
    }

    .radio-option-description {
      font-size: 12px;
      line-height: 16px;
      color: ${globalColors.gray};
    }
  }

  .conflict-resolve_file-name {
    display: flex;
  }
`;

export { StyledBodyContent };
