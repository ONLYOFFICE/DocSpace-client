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

import { mobile } from "@docspace/shared/utils/device";
import { globalColors } from "@docspace/shared/themes";
import { injectDefaultTheme } from "@docspace/shared/utils";

const StyledContainer = styled.div`
  width: 100%;
  max-width: 660px;

  display: flex;
  flex-direction: column;

  gap: 24px;

  .loader {
    rect {
      width: 100%;
    }
  }

  .scope-name-loader {
    margin-bottom: 4px;
  }

  .scope-desc-loader {
    margin-bottom: 2px;
  }
`;

const StyledBlock = styled.div`
  width: 100%;
  height: auto;

  display: flex;
  flex-direction: column;
  gap: 12px;

  .icon-field {
    margin: 0;
  }
`;

const StyledHeaderRow = styled.div`
  width: 100%;

  display: flex;
  flex-direction: row;
  gap: 4px;

  align-items: center;

  div {
    height: 12px;
  }
`;

const StyledInputBlock = styled.div`
  width: 100%;

  display: grid;
  grid-template-columns: 1fr 1fr;

  gap: 16px;

  @media ${mobile} {
    display: flex;

    flex-direction: column;
  }
`;

const StyledInputGroup = styled.div.attrs(injectDefaultTheme)`
  width: 100%;
  height: auto;

  display: flex;
  flex-direction: column;
  gap: 4px;

  svg {
    cursor: pointer;
  }

  .pkce {
    margin-top: 4px;

    display: flex;
    align-items: center;
    gap: 0px;

    .icon-button {
      padding: 0 8px;
    }
  }

  .public_client {
    margin-top: 4px;

    display: flex;
    align-items: center;

    label {
      position: relative;
    }
  }

  .label {
    height: 20px;
  }

  .select {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    margin: 4px 0;

    .client-logo {
      max-width: 32px;
      max-height: 32px;
      width: 32px;
      height: 32px;

      object-size: cover;

      border-radius: 3px;
    }

    p {
      color: ${(props) => props.theme.oauth.clientForm.descriptionColor};
    }
  }

  .description {
    color: ${(props) => props.theme.oauth.clientForm.descriptionColor};
  }

  .input-block-with-button {
    .field-body {
      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 8px;
    }
  }
`;

const StyledInputRow = styled.div`
  width: 100%;

  position: relative;

  display: flex;
  flex-direction: row;
  justify-content: space-between;

  gap: 8px;

  input {
    user-select: none;
  }
`;

const StyledChipsContainer = styled.div`
  width: 100%;

  display: flex;
  flex-wrap: wrap;

  gap: 4px;
`;

const StyledScopesContainer = styled.div.attrs(injectDefaultTheme)<{
  isRequiredError?: boolean;
}>`
  width: 100%;

  display: grid;
  grid-template-columns: 1fr max-content max-content;
  grid-auto-rows: max-content;

  align-items: center;

  gap: 16px 0;

  .header {
    padding-bottom: 8px;

    padding-right: 24px;
    margin-right: -12px;

    border-bottom: ${(props) =>
      props.isRequiredError
        ? `1px solid ${
            props.theme.isBase
              ? globalColors.lightErrorStatus
              : globalColors.darkErrorStatus
          }`
        : props.theme.oauth.clientForm.headerBorder};
  }

  .header-error {
    margin-top: -8px;
  }

  .header-last {
    margin-right: 0px;
    padding-right: 0px;
  }

  .checkbox-read {
    margin-right: 12px;
  }
`;

const StyledScopesName = styled.div.attrs(injectDefaultTheme)`
  display: flex;

  align-content: flex-start;
  flex-direction: column;

  .scope-name {
    margin-bottom: 2px;
  }

  .scope-desc {
    color: ${(props) => props.theme.oauth.clientForm.scopeDesc};
  }
`;

const StyledScopesCheckbox = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  align-items: flex-start;
  justify-content: flex-end;

  .checkbox {
    margin-right: 0px;
  }
`;

const StyledButtonContainer = styled.div`
  width: fit-content;

  display: flex;
  align-items: center;
  justify-content: flex-start;

  gap: 8px;

  @media ${mobile} {
    width: 100%;
  }
`;

const StyledInputAddBlock = styled.div`
  width: calc(100% - 40px);
  height: 44px;

  padding: 0 6px;

  box-sizing: border-box;

  cursor: pointer;

  z-index: 200;

  display: none;

  align-items: center;
  justify-content: space-between;
  gap: 10px;

  background: ${(props) => props.theme.backgroundColor};

  position: absolute;
  top: 40px;
  left: 0px;

  border-radius: 3px;
  border: ${(props) => props.theme.oauth.clientForm.headerBorder};

  box-shadow: ${(props) => props.theme.navigation.boxShadow};

  .add-block {
    display: flex;
    align-items: center;
    gap: 4px;

    p {
      color: ${globalColors.lightBlueMain};
    }

    svg path {
      fill: ${globalColors.lightBlueMain};
    }
  }
`;

const StyledCheckboxGroup = styled.div`
  width: 100%;

  position: relative;

  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;

  margin-top: 4px;
`;

export {
  StyledContainer,
  StyledBlock,
  StyledHeaderRow,
  StyledInputBlock,
  StyledInputGroup,
  StyledInputRow,
  StyledChipsContainer,
  StyledScopesContainer,
  StyledScopesName,
  StyledScopesCheckbox,
  StyledButtonContainer,
  StyledInputAddBlock,
  StyledCheckboxGroup,
};
