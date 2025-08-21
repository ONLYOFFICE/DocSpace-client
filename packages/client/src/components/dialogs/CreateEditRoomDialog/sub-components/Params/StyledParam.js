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

import styled, { css } from "styled-components";

import { injectDefaultTheme } from "@docspace/shared/utils";

const StyledParam = styled.div.attrs(injectDefaultTheme)`
  box-sizing: border-box;
  display: flex;
  width: 100%;

  ${(props) =>
    props.storageLocation
      ? css``
      : props.folderName
        ? css`
            flex-direction: column;
            gap: 4px;
          `
        : ""}

  .set_room_params-info {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .set_room_params-info-title {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 6px;

      .set_room_params-info-title-text {
        font-weight: 600;
        font-size: 13px;
        line-height: 20px;
      }
    }
    .set_room_params-info-description {
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      color: ${(props) =>
        props.theme.createEditRoomDialog.commonParam.descriptionColor};
    }
  }

  .set_room_params-toggle {
    width: 28px;
    height: 16px;
    margin: 2px 0;
  }
`;

export { StyledParam };
