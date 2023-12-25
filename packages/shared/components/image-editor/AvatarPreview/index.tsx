import React from "react";
import styled from "styled-components";

import { Avatar, AvatarRole, AvatarSize } from "../../avatar";
import { Text } from "../../text";

import { mobile } from "../../../utils";

const StyledWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media ${mobile} {
    display: none;
  }

  .avatar {
    height: 124px;
    width: 124px;
    align-self: center;
  }

  .name-preview {
    max-width: 198px;
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px;
    border: 1px solid #eceef1;
    border-radius: 6px;
  }
`;

const AvatarPreview = ({
  avatar,
  userName,
}: {
  avatar: string;
  userName: string;
}) => {
  return (
    <StyledWrapper>
      <Avatar
        className="avatar"
        size={AvatarSize.max}
        role={AvatarRole.user}
        source={avatar}
        userName={userName}
        editing={false}
      />
      <div className="name-preview">
        <Avatar
          size={AvatarSize.min}
          role={AvatarRole.user}
          source={avatar}
          userName={userName}
          editing={false}
        />
        <Text fontWeight={600} fontSize="15px" truncate>
          {userName}
        </Text>
      </div>
    </StyledWrapper>
  );
};

export default AvatarPreview;
