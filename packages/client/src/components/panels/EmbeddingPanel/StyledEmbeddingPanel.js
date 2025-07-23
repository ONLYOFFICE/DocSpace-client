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
import { globalColors, zIndex } from "@docspace/shared/themes";

const StyledBody = styled.div`
  padding-left: 16px;
  .embedding-panel_header-link {
    margin: 10px 0 2px;
  }

  .embedding-panel_combo-box {
    margin-bottom: 6px;
  }

  .embedding-panel_banner {
    display: flex;
    padding: 12px 16px;
    gap: 16px;
    margin: 0px -16px 12px;
    background-color: ${(props) => props.theme.infoBlock.background};

    .embedding-panel_banner-close-icon {
      min-width: 12px;
      min-height: 12px;
      margin-inline-start: auto;
    }
  }

  .embedding-panel_body {
    .embedding-panel_bar {
      .embedding-panel_bar-header {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .header-icon {
        svg path {
          fill: ${({ theme }) => theme.embeddingPanel.iconColor};
        }
      }
    }

    .embedding-panel_header-text {
      margin: 16px 0;
    }

    .embedding-panel_checkbox-container {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .embedding-panel_checkbox-element {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
    }

    .embedding-panel_inputs-container {
      display: flex;
      margin-bottom: 20px;
      gap: 8px;

      .embedding-panel_block {
        width: 100%;

        .embedding-panel_size-block {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 32px;
        }
      }

      .embedding-panel_input {
        width: 94px;
      }
    }
  }

  .embedding-panel_code-container {
    margin-top: 16px;
    -webkit-tap-highlight-color: ${globalColors.tapHighlight};
  }

  .embedding-panel_text {
    padding: 0px 0 4px;
  }

  .embedding-panel_copy-icon {
    position: absolute;
    z-index: ${zIndex.content};
    margin: 8px;
    inset-inline-end: 32px;
  }

  .embedding-panel_preview-button {
    margin-top: auto;
  }
`;

export { StyledBody };
