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
import { Base } from "@docspace/shared/themes";
import { tablet, mobile } from "@docspace/shared/utils";

const StyledHotkeysPanel = styled.div`
  .hotkeys_sub-header {
    font-weight: 700;
    font-size: 16px;
    margin: 20px 0 6px;
  }

  .hotkeys_row {
    width: 100%;
    min-height: 41px;
    box-sizing: border-box;
    border-bottom: none;

    .row_content {
      margin: 12px 0 12px;

      @media ${tablet} {
        height: unset;
      }
    }
  }

  .hotkey-key-description {
    max-width: 320px;
    width: 100%;

    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-word;

    @media ${mobile} {
      max-width: 140px;
      word-wrap: break-word;
      white-space: normal;
    }
  }

  .hotkeys-key {
    margin-block: 0;
    margin-inline: 0 auto;

    @media ${mobile} {
      margin-inline: auto 0;
      width: fit-content;
    }
  }
`;

StyledHotkeysPanel.defaultProps = { theme: Base };

export { StyledHotkeysPanel };
