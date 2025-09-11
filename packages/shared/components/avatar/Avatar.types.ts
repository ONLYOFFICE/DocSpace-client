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

import React from "react";
import { Nullable } from "../../types";
import { AVATAR_ACTION_KEYS } from "../../constants";

import { AvatarRole, AvatarSize } from "./Avatar.enums";

export type TAvatarModel = { label: string; icon: string } & (
  | {
      key: string;
      onClick: () => void;
    }
  | {
      key: typeof AVATAR_ACTION_KEYS.PROFILE_AVATAR_UPLOAD;
      onClick: (ref?: React.RefObject<Nullable<HTMLDivElement>>) => void;
    }
);

export type AvatarProps = {
  /** Size of avatar */
  size: AvatarSize;
  /** Adds a table of user roles */
  role: AvatarRole;
  /** Displays as `Picture` in case the url is specified and as `Icon` in case the path to the .svg file is specified */
  source?: string;
  /** Allows to display a user name as initials when `source` is set to blank */
  userName?: string;
  /** Enables avatar editing */
  editing?: boolean;
  /** Allows to display as a default icon when `source` is set to blank */
  isDefaultSource?: boolean;
  /** Function called when the avatar change button is pressed */
  editAction?: () => void;
  /** Hides user role */
  hideRoleIcon?: boolean;
  /** Accepts class */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style  */
  style?: React.CSSProperties;
  /** Show tooltip on hover role icon */
  withTooltip?: boolean;
  /** Tooltip content */
  tooltipContent?: string;
  onClick?: (e: React.MouseEvent) => void;
  /** Display initials for group when `source` is set to blank */
  isGroup?: boolean;
  /** Accepts roleIcon */
  roleIcon?: React.ReactElement;
  noClick?: boolean;
  hasAvatar?: boolean;
  onChangeFile?: () => void;

  model?: TAvatarModel[];
  isNotIcon?: boolean;
  imgClassName?: string;
  dataTestId?: string;
};
