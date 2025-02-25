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

import { injectDefaultTheme } from "@docspace/shared/utils";

export const OAuthContainer = styled.div`
  width: 100%;

  .ec-subheading {
    margin-top: 8px;
    text-align: center;
  }

  .guide-link {
    color: ${(props) => props.theme.client.settings.webhooks.linkColor};

    &:hover {
      color: ${(props) => props.theme.client.settings.webhooks.linkColor};
    }

    margin-bottom: 20px;
  }
`;

export const StyledContainer = styled.div`
  width: 100%;
  height: 100%;

  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  gap: 20px;

  padding-top: 16px;
`;

export const StyledPreviewContainer = styled.div.attrs(injectDefaultTheme)`
  width: 100%;
  height: 152px;

  box-sizing: border-box;

  border: ${(props) => props.theme.oauth.previewDialog.border};

  border-radius: 6px;

  display: flex;
  align-items: center;
  justify-content: center;

  .social-button {
    max-width: fit-content;

    padding: 11px 16px;

    box-sizing: border-box;

    display: flex;
    gap: 16px;

    .iconWrapper {
      padding: 0;
      margin: 0;
    }
  }
`;

export const StyledBlocksContainer = styled.div`
  width: 100%;
  height: auto;

  display: flex;
  flex-direction: column;
  gap: 12px;

  .block-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
`;

export const StyledInfoContainer = styled.div.attrs(injectDefaultTheme)<{
  showDescription: boolean;
  withShowText: boolean;
}>`
  width: 100%;
  height: 100%;

  box-sizing: border-box;

  padding-top: 16px;

  display: flex;
  flex-direction: column;

  .client-block {
    width: 100%;
    height: 32px;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    margin-bottom: 12px;

    .client-block__info {
      width: 100%;

      display: flex;
      flex-direction: row;
      align-items: center;

      gap: 8px;

      .client-block__info-logo {
        width: 32px;
        height: 32px;

        max-width: 32px;
        max-height: 32px;

        border-radius: 3px;
      }
    }
  }

  .description {
    max-height: ${(props) =>
      props.showDescription ? "100%" : props.withShowText ? "100px" : "100%"};

    overflow: hidden;

    margin-bottom: ${(props) => (props.withShowText ? "4px" : 0)};
  }

  .desc-link {
    color: ${(props) => props.theme.oauth.infoDialog.descLinkColor};
  }

  .block-header {
    margin-top: 20px;
    margin-bottom: 12px;

    color: ${(props) => props.theme.oauth.infoDialog.blockHeaderColor};
  }

  .creator-block {
    margin: 8px 0;

    display: flex;
    flex-direction: row;
    align-items: center;

    gap: 8px;
  }

  .privacy-block {
    display: flex;

    .separator {
      display: inline-block;

      margin-top: 2px;

      height: 16px;
      width: 1px;

      margin: 0 8px;

      background: ${(props) => props.theme.oauth.infoDialog.separatorColor};
    }
  }

  .property-tag_list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    .property-tag {
      max-width: 195px;
      margin: 0;
      background: ${(props) => props.theme.infoPanel.details.tagBackground};
      p {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
`;

export const StyledGenerateDevelopTokenContainer = styled.div`
  .dates {
    margin-top: 16px;
    margin-bottom: 0;
  }
`;
