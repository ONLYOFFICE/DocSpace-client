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

import { mobile } from "../../utils";
import { Base } from "../../themes";

const StyledDropzone = styled.div<{ $isLoading?: boolean }>`
  cursor: pointer;
  box-sizing: border-box;
  width: 100%;
  height: 150px;
  border: 2px dashed
    ${(props) => props.theme.createEditRoomDialog.dropzone.borderColor};
  border-radius: 6px;

  position: relative;

  .dropzone_loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .dropzone {
    height: 100%;
    width: 100%;
    visibility: ${(props) => (props.$isLoading ? "hidden" : "visible")};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;

    user-select: none;

    &-link {
      display: flex;
      flex-direction: row;
      gap: 4px;

      font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
      line-height: 20px;
      &-main {
        font-weight: 600;
        text-decoration: underline;
        text-decoration-style: dashed;
        text-underline-offset: 1px;
      }
      &-secondary {
        font-weight: 400;
        color: ${(props) =>
          props.theme.createEditRoomDialog.dropzone.linkSecondaryColor};
      }

      @media ${mobile} {
        &-secondary {
          display: none;
        }
      }
    }

    &-exsts {
      font-weight: 600;
      font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
      line-height: 16px;
      color: ${(props) => props.theme.createEditRoomDialog.dropzone.exstsColor};
    }
  }
`;

StyledDropzone.defaultProps = { theme: Base };

export default StyledDropzone;
