import React from "react";
import styled from "styled-components";

import Text from "@docspace/components/text";
import Avatar from "@docspace/components/avatar";

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
      <StyledAvatar source={avatar} size={"min"} />

      {/* @ts-ignore */}
      <Text
        className={"description-text"}
        type="page"
        fontWeight="600"
        fontSize="13px"
        isTextOverflow
      >
        {displayName}
      </Text>
    </>
  );
};

export default CreatorCell;
