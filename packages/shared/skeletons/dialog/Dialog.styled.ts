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

import { injectDefaultTheme, mobile } from "../../utils";
import { DialogAsideSkeletonProps, DialogSkeletonProps } from "./Dialog.types";

const StyledDialogLoader = styled.div.attrs(
  injectDefaultTheme,
)<DialogSkeletonProps>`
  height: auto;

  width: ${(props) => (props.isLarge ? "520px" : "400px")};
  @media ${mobile} {
    width: 100%;
  }

  .dialog-loader-header {
    border-bottom: ${(props) =>
      `1px solid ${props.theme.modalDialog.headerBorderColor}`};
    padding: 12px 16px;
  }

  .dialog-loader-body {
    padding: 12px 16px 8px;
  }

  .dialog-loader-footer {
    ${(props) =>
      props.withFooterBorder &&
      `border-top: 1px solid ${props.theme.modalDialog.headerBorderColor}`};
    display: flex;
    gap: 10px;
    padding: 16px;
  }
`;

const StyledDialogAsideLoader = styled.div<DialogAsideSkeletonProps>`
  ${(props) =>
    props.isPanel
      ? css`
          .dialog-loader-header {
            padding: 12px 16px;

            height: 53px;

            border-bottom: ${`1px solid ${props.theme.modalDialog.headerBorderColor}`};

            box-sizing: border-box;
          }

          .dialog-loader-body {
            padding: 16px;
          }

          .dialog-loader-footer {
            padding: 12px 16px;
            position: fixed;
            bottom: 0;

            height: 71px;

            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;

            box-sizing: border-box;

            border-top: ${`1px solid ${props.theme.modalDialog.headerBorderColor}`};
          }
        `
      : css`
          .dialog-loader-header {
            border-bottom: ${`1px solid ${props.theme.modalDialog.headerBorderColor}`};
            padding: 12px 16px;
          }

          .dialog-loader-body {
            padding: 16px;
          }

          .dialog-loader-footer {
            ${props.withFooterBorder &&
            `border-top: 1px solid ${props.theme.modalDialog.headerBorderColor}`};
            padding: 16px;
            position: fixed;
            bottom: 0;
            width: calc(100% - 32px);
          }
        `}
`;

const StyledDataReassignmentLoader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  .user {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .name {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .avatar {
    width: 80px;
    height: 80px;
  }

  .new-owner_header {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-bottom: 12px;
  }

  .new-owner_add {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .description {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
`;

export {
  StyledDialogLoader,
  StyledDialogAsideLoader,
  StyledDataReassignmentLoader,
};
