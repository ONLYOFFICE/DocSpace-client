import styled from "styled-components";

import { Text } from "@docspace/shared/components/text";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";

const StyledAvatar = styled(Avatar)`
  width: 16px;
  margin-inline-end: 4px;
  max-width: 100%;
  height: 16px;

  min-width: unset;
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
        className="textOverflow"
      />

      <Text
        className="description-text textOverflow"
        fontWeight="600"
        fontSize="13px"
      >
        {displayName}
      </Text>
    </>
  );
};

export default CreatorCell;
