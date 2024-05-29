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

import styled, { css } from "styled-components";
import { Scrollbar } from "@docspace/shared/components/scrollbar";
import { Base } from "@docspace/shared/themes";
import { Box } from "@docspace/shared/components/box";

const StyledEmbeddingPanel = styled.div`
  .embedding-panel {
    .scroll-body {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              padding-left: 0 !important;
            `
          : css`
              padding-right: 0 !important;
            `}
    }
  }

  .embedding_header {
    padding: 0 16px;
    border-bottom: ${(props) => props.theme.filesPanels.sharing.borderBottom};

    .embedding_heading {
      font-weight: 700;
      font-size: 21px;
      margin: 12px 0;
    }
  }
`;

StyledEmbeddingPanel.defaultProps = { theme: Base };

const StyledScrollbar = styled(Scrollbar)`
  position: relative;
  padding: 16px 0;
  height: calc(100vh - 87px) !important;
`;

const StyledBody = styled.div`
  .embedding-panel_body {
    padding: 20px 16px 0 16px;

    .embedding-panel_description {
      color: ${({ theme }) => theme.embeddingPanel.descriptionTextColor};
      margin-bottom: 18px;
    }

    .embedding-panel_header-text {
      margin-bottom: 16px;
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
          height: 32px;
        }
      }

      .embedding-panel_input {
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                margin-left: 8px;
              `
            : css`
                margin-right: 8px;
              `}
        width: 94px;
      }
    }
  }

  .embedding-panel_code-container {
    margin-top: 16px;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  .embedding-panel_text {
    padding: 0px 0 4px 0;
  }

  .embedding-panel_copy-icon {
    position: absolute;
    z-index: 1;
    margin: 8px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            left: 16px;
          `
        : css`
            right: 16px;
          `}
  }

  .embedding-panel_preview-button {
    margin-top: auto;
  }
`;

const StyledButtons = styled(Box)`
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 10px;

  position: absolute;
  bottom: 0px;
  width: 100%;
  background: ${({ theme }) => theme.filesPanels.sharing.backgroundButtons};
  border-top: ${({ theme }) => theme.filesPanels.sharing.borderTop};
`;

export { StyledEmbeddingPanel, StyledScrollbar, StyledBody, StyledButtons };
