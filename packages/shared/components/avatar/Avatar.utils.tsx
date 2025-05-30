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
import classNames from "classnames";

import AdministratorReactSvg from "PUBLIC_DIR/images/administrator.react.svg";
import OwnerReactSvg from "PUBLIC_DIR/images/owner.react.svg";
import CameraReactSvg from "PUBLIC_DIR/images/camera.react.svg";

import { IconSizeType } from "../../utils";
import { AvatarSize, AvatarRole } from "./Avatar.enums";

import styles from "./Avatar.module.scss";

export const getRoleIcon = (role: AvatarRole) => {
  switch (role) {
    case "admin":
      return (
        <AdministratorReactSvg
          data-size={IconSizeType.scale}
          className={classNames(styles.adminIcon, "admin_icon")}
        />
      );
    case "owner":
      return (
        <OwnerReactSvg
          data-size={IconSizeType.scale}
          className={classNames(styles.ownerIcon, "owner_icon")}
        />
      );
    default:
      return null;
  }
};

const getInitials = (userName: string, isGroup: boolean) => {
  const initials = userName
    .split(/\s/)
    .reduce(
      (response: string, word: string) => (response += word.slice(0, 1)),
      "",
    )
    .substring(0, 2);

  return isGroup ? initials.toUpperCase() : initials;
};

export const Initials = ({
  userName,
  size,
  isGroup,
}: {
  userName: string;
  size: AvatarSize;
  isGroup: boolean;
}) => (
  <div
    className={classNames(styles.namedAvatar, { [styles.isGroup]: isGroup })}
    data-size={size}
  >
    {getInitials(userName, isGroup)}
  </div>
);

export const EmptyIcon = ({ size }: { size: IconSizeType }) => {
  return <CameraReactSvg className={styles.emptyIcon} data-size={size} />;
};
