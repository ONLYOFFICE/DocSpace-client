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
import { isMobileOnly } from "react-device-detect";

import { injectDefaultTheme } from "@docspace/shared/utils";

const StyledEmptyContainer = styled.div`
  width: 100%;

  display: flex;
  justify-content: center;
`;

const StyledContainer = styled.div`
  width: 100%;
  max-width: 700px;

  display: flex;
  flex-direction: column;

  gap: 20px;
`;

const PluginListContainer = styled.div`
  width: 100%;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(328px, 1fr));

  gap: 20px;
`;

const StyledPluginItem = styled.div.attrs(injectDefaultTheme)<{
  description?: string;
}>`
  width: 100%;

  height: 135px;
  max-height: 135px;

  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 48px 1fr;

  gap: 20px;

  border: 1px solid ${(props) => props.theme.plugins.borderColor};
  border-radius: 12px;

  padding: 20px;

  box-sizing: border-box;

  .plugin-logo {
    width: 48px;
    height: 48px;

    border-radius: 4px;
  }

  .plugin-info {
    width: 100%;
    height: auto;

    display: flex;
    flex-direction: column;

    gap: 8px;

    .plugin-description {
      width: 100%;

      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
  }

  ${(props) => !props.description && isMobileOnly && `max-height: 112px;`}
`;

const StyledPluginHeader = styled.div`
  width: 100%;
  height: 22px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  .plugin-name {
    margin: 0;
    padding: 0;

    font-weight: 700 !important;
    font-size: 16px !important;
    line-height: 22px;
  }

  .plugin-controls {
    height: 100%;

    display: flex;
    gap: 16px;

    align-items: center;

    .plugin-toggle-button {
      position: relative;

      gap: 0;
    }
  }
`;

export {
  StyledEmptyContainer,
  StyledContainer,
  PluginListContainer,
  StyledPluginItem,
  StyledPluginHeader,
};
