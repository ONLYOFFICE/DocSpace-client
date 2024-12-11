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
import { globalColors } from "../../themes";
import { injectDefaultTheme } from "../../utils";

const TimeInput = styled.div.attrs(injectDefaultTheme)<{
  hasError?: boolean;
  isFocused?: boolean;
}>`
  width: 57px;
  height: 32px;
  box-sizing: border-box;
  padding: 0px 6px;
  direction: ltr;

  border: 1px solid ${globalColors.grayStrong};
  border-radius: 3px;

  transition: "all 0.2s ease 0s";

  display: flex;
  align-items: center;

  border-color: ${(props) =>
    props.hasError ? globalColors.lightErrorStatus : globalColors.grayStrong};

  background-color: ${(props) => props.theme.input.backgroundColor};

  ${(props) =>
    props.isFocused &&
    css`
      border-color: ${globalColors.lightBlueMain};
    `}

  :focus {
    border-color: ${globalColors.lightBlueMain};
  }

  input {
    max-width: 22px;
    padding: 0;
    padding-inline: 2.5px -2.5px;
  }

  input[type="search"]::-webkit-search-decoration,
  input[type="search"]::-webkit-search-cancel-button,
  input[type="search"]::-webkit-search-results-button,
  input[type="search"]::-webkit-search-results-decoration {
    -webkit-appearance: none;
  }
`;

export default TimeInput;
