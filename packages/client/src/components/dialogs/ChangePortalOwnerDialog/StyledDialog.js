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

const StyledOwnerInfo = styled.div.attrs(injectDefaultTheme)`
  display: flex;
  align-items: center;
  justify-content: start;

  margin-top: 8px;
  margin-bottom: 24px;

  .info {
    padding-inline-start: 16px;
    display: flex;
    flex-direction: column;

    .display-name {
      font-weight: 700;
      font-size: 16px;
      line-height: 22px;
    }

    .status {
      font-weight: 600;
      font-size: 13px;
      line-height: 20px;
      color: ${(props) => props.theme.dialogs.disableText};
    }
  }
`;

const StyledPeopleSelectorInfo = styled.div.attrs(injectDefaultTheme)`
  margin-bottom: 12px;

  .new-owner {
    font-weight: 600;
    font-size: 15px;
    line-height: 16px;
    margin-bottom: 4px;
  }

  .description {
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;

    color: ${(props) => props.theme.dialogs.disableText};
  }
`;

const StyledPeopleSelector = styled.div.attrs(injectDefaultTheme)`
  display: flex;
  align-items: center;

  margin-bottom: 24px;

  .label {
    font-weight: 600;
    font-size: 13px;
    line-height: 20px;

    color: ${(props) => props.theme.dialogs.disableText};

    margin-inline-start: 8px;
  }
`;

const StyledAvailableList = styled.div.attrs(injectDefaultTheme)`
  display: flex;

  flex-direction: column;

  margin-bottom: 24px;

  .list-header {
    font-weight: 600;
    font-size: 13px;
    line-height: 20px;

    margin-bottom: 8px;
  }

  .list-item {
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;

    margin-bottom: 2px;
  }
`;

const StyledFooterWrapper = styled.div.attrs(injectDefaultTheme)`
  height: 100%;
  width: 100%;

  display: flex;

  flex-direction: column;

  .info {
    margin-bottom: 16px;

    font-weight: 400;
    font-size: 13px;
    line-height: 20px;
  }

  .button-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;

    flex-direction: row;

    gap: 8px;
  }

  .delete-profile-container {
    display: flex;
    align-items: center;

    margin-bottom: 16px;
  }
`;

const StyledSelectedOwnerContainer = styled.div.attrs(injectDefaultTheme)`
  width: 100%;

  box-sizing: border-box;

  display: flex;

  flex-direction: column;

  gap: 14px;

  margin-bottom: 24px;
`;

const StyledSelectedOwner = styled.div.attrs(injectDefaultTheme)`
  width: fit-content;
  height: 28px;

  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 4px 15px;
  gap: 8px;

  box-sizing: border-box;

  background: ${({ currentColorScheme }) => currentColorScheme.main?.accent};

  border-radius: 16px;

  .text {
    color: ${({ currentColorScheme }) => currentColorScheme.text?.accent};

    font-weight: 600;
    font-size: 13px;
    line-height: 20px;
  }

  .cross-icon {
    display: flex;
    align-items: center;

    svg {
      cursor: pointer;

      path {
        fill: ${({ currentColorScheme }) => currentColorScheme.text?.accent};
      }
    }
  }
`;

export {
  StyledOwnerInfo,
  StyledPeopleSelectorInfo,
  StyledPeopleSelector,
  StyledAvailableList,
  StyledFooterWrapper,
  StyledSelectedOwnerContainer,
  StyledSelectedOwner,
};
