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

import SecuritySvgUrl from "PUBLIC_DIR/images/security.svg?url";
import styled from "styled-components";

import { commonIconsStyles } from "@docspace/shared/utils";

import FavoriteIcon from "PUBLIC_DIR/images/favorite.react.svg";
import FileActionsConvertEditDocIcon from "PUBLIC_DIR/images/file.actions.convert.edit.doc.react.svg";
import FileActionsLockedIcon from "PUBLIC_DIR/images/file.actions.locked.react.svg";
import EditFormIcon from "PUBLIC_DIR/images/access.edit.form.react.svg";
import { Base } from "@docspace/shared/themes";

export const EncryptedFileIcon = styled.div`
  background: url(${SecuritySvgUrl}) no-repeat 0 0 / 16px 16px transparent;
  height: 16px;
  position: absolute;
  width: 16px;
  margin-top: 14px;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: 12px;
        `
      : css`
          margin-left: 12px;
        `}
`;

export const StyledFavoriteIcon = styled(FavoriteIcon)`
  ${commonIconsStyles}
`;

export const StyledFileActionsConvertEditDocIcon = styled(
  FileActionsConvertEditDocIcon,
)`
  ${commonIconsStyles}
  path {
    fill: ${(props) => props.theme.filesIcons.fill};
  }

  &:hover {
    path {
      fill: ${(props) => props.theme.filesIcons.hoverFill};
    }
  }
`;

StyledFileActionsConvertEditDocIcon.defaultProps = { theme: Base };

export const StyledFileActionsLockedIcon = styled(FileActionsLockedIcon)`
  ${commonIconsStyles}
  path {
    fill: ${(props) => props.theme.filesIcons.fill};
  }

  &:hover {
    path {
      fill: ${(props) => props.theme.filesIcons.hoverFill};
    }
  }
`;

StyledFileActionsLockedIcon.defaultProps = { theme: Base };
export const StyledFileActionsEditFormIcon = styled(EditFormIcon)`
  ${commonIconsStyles}
  path {
    fill: ${(props) => props.theme.filesIcons.fill};
  }

  &:hover {
    path {
      fill: ${(props) => props.theme.filesIcons.hoverFill};
    }
  }
`;

StyledFileActionsEditFormIcon.defaultProps = { theme: Base };
