import React from "react";
import { useTheme } from "styled-components";
import { Avatar, AvatarRole, AvatarSize } from "../../../components/avatar";
import { Text } from "../../../components/text";

import StyledUserTooltip from "../PeopleSelector.styled";
import { UserTooltipProps } from "../PeopleSelector.types";

const UserTooltip = ({
  avatarUrl,
  label,
  email,
  position,
}: UserTooltipProps) => {
  const theme = useTheme();

  return (
    <StyledUserTooltip>
      <div className="block-avatar">
        <Avatar
          className="user-avatar"
          size={AvatarSize.min}
          role={AvatarRole.user}
          source={avatarUrl}
          userName=""
          editing={false}
        />
      </div>

      <div className="block-info">
        <Text isBold fontSize="13px" fontWeight={600} truncate title={label}>
          {label}
        </Text>
        <Text
          color={theme.peopleSelector.textColor}
          fontSize="13px"
          className="email-text"
          truncate
          title={email}
        >
          {email}
        </Text>
        <Text fontSize="13px" fontWeight={600} truncate title={position}>
          {position}
        </Text>
      </div>
    </StyledUserTooltip>
  );
};

export default UserTooltip;
