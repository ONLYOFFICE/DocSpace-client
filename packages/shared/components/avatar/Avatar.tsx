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

import React, { memo } from "react";

import styled, { useTheme } from "styled-components";

import PencilReactSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";

import { IconSizeType, commonIconsStyles } from "../../utils";

import { IconButton } from "../icon-button";
import { Text } from "../text";
import { TGetTooltipContent, Tooltip } from "../tooltip";

import {
  EmptyIcon,
  EditContainer,
  AvatarWrapper,
  RoleWrapper,
  NamedAvatar,
  StyledImage,
  StyledAvatar,
  StyledIconWrapper,
} from "./Avatar.styled";

import { AdministratorReactSvg, OwnerReactSvg } from "./svg";
import { AvatarProps } from "./Avatar.types";
import { AvatarRole, AvatarSize } from "./Avatar.enums";

export { AvatarRole, AvatarSize };

// const StyledGuestIcon = styled(GuestReactSvg)`
//   ${commonIconsStyles}
// `;
const StyledAdministratorIcon = styled(AdministratorReactSvg)`
  ${commonIconsStyles}
`;
const StyledOwnerIcon = styled(OwnerReactSvg)`
  ${commonIconsStyles}
`;
const getRoleIcon = (role: AvatarRole) => {
  switch (role) {
    case "admin":
      return (
        <StyledAdministratorIcon
          size={IconSizeType.scale}
          className="admin_icon"
        />
      );
    case "owner":
      return (
        <StyledOwnerIcon size={IconSizeType.scale} className="owner_icon" />
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

const Initials = ({
  userName,
  size,
  isGroup,
}: {
  userName: string;
  size: AvatarSize;
  isGroup: boolean;
}) => (
  <NamedAvatar size={size} isGroup={isGroup}>
    {getInitials(userName, isGroup)}
  </NamedAvatar>
);

const AvatarPure = ({
  size,
  source,
  userName,
  role,
  editing,
  editAction,
  isDefaultSource = false,
  hideRoleIcon,
  tooltipContent,
  withTooltip,
  className,
  onClick,
  isGroup = false,
  roleIcon: roleIconProp,
}: AvatarProps) => {
  const defaultTheme = useTheme();

  const interfaceDirection = defaultTheme?.interfaceDirection;

  let isDefault = false;
  let isIcon = false;

  if (source?.includes("default_user_photo")) isDefault = true;
  else if (source?.includes(".svg")) isIcon = true;

  const avatarContent = source ? (
    isIcon ? (
      <StyledIconWrapper>
        <IconButton iconName={source} className="icon" isDisabled />
      </StyledIconWrapper>
    ) : (
      <StyledImage src={source} isDefault={isDefault} />
    )
  ) : userName ? (
    <Initials userName={userName} size={size} isGroup={isGroup} />
  ) : isDefaultSource ? (
    <StyledImage isDefault />
  ) : (
    <EmptyIcon size={IconSizeType.scale} />
  );

  const roleIcon = roleIconProp ?? getRoleIcon(role);

  const uniqueTooltipId = withTooltip ? `roleTooltip_${Math.random()}` : "";
  const tooltipPlace = interfaceDirection === "rtl" ? "left" : "right";

  const getTooltipContent = ({ content }: TGetTooltipContent) => (
    <Text fontSize="12px">{content}</Text>
  );

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 1) return;

    if (onClick) onClick(e);
  };

  return (
    <StyledAvatar
      size={size}
      data-testid="avatar"
      className={className}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      <AvatarWrapper
        source={source}
        userName={userName || ""}
        className="avatar-wrapper"
        isGroup={isGroup}
      >
        {avatarContent}
      </AvatarWrapper>
      {editing && size === "max" ? (
        <EditContainer>
          <IconButton
            className="edit_icon"
            iconName={PencilReactSvgUrl}
            onClick={editAction}
            size={16}
          />
        </EditContainer>
      ) : (
        !hideRoleIcon && (
          <>
            <RoleWrapper
              size={size}
              data-tooltip-id={uniqueTooltipId}
              data-tooltip-content={tooltipContent}
              className="avatar_role-wrapper"
            >
              {roleIcon}
            </RoleWrapper>
            {withTooltip && (
              <Tooltip
                float
                id={uniqueTooltipId}
                getContent={getTooltipContent}
                place={tooltipPlace}
                opacity={1}
              />
            )}
          </>
        )
      )}
    </StyledAvatar>
  );
};

const Avatar = memo(AvatarPure);

export { Avatar, AvatarPure };
