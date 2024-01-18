import React from "react";
import styled from "styled-components";

import { Text } from "@docspace/shared/components/text";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";

const StyledAvatar = styled(Avatar)`
  width: 16px;
  min-width: 16px;
  max-width: 16px;
  height: 16px;

  margin-right: 4px;
`;

interface CreatorCellProps {
  avatar: string;
  displayName: string;
}

const CreatorCell = ({ avatar, displayName }: CreatorCellProps) => {
  return (
    <>
      <StyledAvatar
        source={avatar}
        size={AvatarSize.min}
        role={AvatarRole.user}
      />

      <Text className={"description-text"} fontWeight="600" fontSize="13px">
        {displayName}
      </Text>
    </>
  );
};

export default CreatorCell;
