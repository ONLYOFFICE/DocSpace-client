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

  const roleIcon = getRoleIcon(role);

  const uniqueTooltipId = withTooltip ? `roleTooltip_${Math.random()}` : "";
  const tooltipPlace = interfaceDirection === "rtl" ? "left" : "right";

  const getTooltipContent = ({ content }: TGetTooltipContent) => (
    <Text fontSize="12px">{content}</Text>
  );

  return (
    <StyledAvatar
      size={size}
      data-testid="avatar"
      className={className}
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
