import React from "react";
import styled from "styled-components";

import Text from "@docspace/components/text";
import Checkbox from "@docspace/components/checkbox";
//@ts-ignore
import TableCell from "@docspace/components/table-container/TableCell";
import Loader from "@docspace/components/loader";
import Avatar from "@docspace/components/avatar";

const StyledContainer = styled.div`
  .table-container_row-checkbox {
    margin-left: -8px;

    width: 16px;

    padding: 16px 8px 16px 16px;
  }
`;

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
        type="page"
        title={name}
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
