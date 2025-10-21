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
import { ModalDialog } from "@docspace/shared/components/modal-dialog";

export const ModalDialogStyled = styled(ModalDialog).attrs(injectDefaultTheme)`
  .info {
    line-height: 20px;
    padding-bottom: 16px;
  }

  ${(props) =>
    !props.isLarge &&
    `
        .info:last-child {
            padding-bottom: 0;
        }
        `};

  .item-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border: ${({ theme }) => theme.oformGallery.submitToGalleryTile.border};
    border-radius: 6px;
    padding: 4px;
    width: max-content;

    &:hover {
      cursor: pointer;
      background-color: ${({ theme }) =>
        theme.oformGallery.submitToGalleryTile.background};
    }
  }

  .icon {
    width: 24px;
    height: 24px;
    margin-inline-end: 4px;
    svg {
      width: 24px;
      height: 24px;
    }
  }

  .item-title {
    font-weight: 600;
    font-size: 13px;
    display: flex;
    min-width: 0;
    gap: 0;

    .name {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    .exst {
      flex-shrink: 0;
      color: ${({ theme }) => theme.oformGallery.submitToGalleryTile.colorExt};
    }
  }
`;
