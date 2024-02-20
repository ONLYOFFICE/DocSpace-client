import React from "react";
import styled from "styled-components";

import { RectangleSkeleton } from "@docspace/shared/skeletons";

const StyledGroupsLoader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
`;

const StyledGroupMemberLoader = styled.div`
  width: 100%;
  height: 48px;

  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  gap: 8px;

  .avatar {
    min-height: 32px;
    min-width: 32px;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: start;
    gap: 4px;
  }
`;

const GroupsLoader = () => {
  return (
    <StyledGroupsLoader>
      {[...Array(5).keys()].map((i) => (
        <StyledGroupMemberLoader key={i}>
          <RectangleSkeleton
            className="avatar"
            width={"32px"}
            height={"32px"}
            borderRadius={"50%"}
          />
          <div className="user-info">
            <RectangleSkeleton
              width={"128px"}
              height={"12px"}
              borderRadius={"3px"}
            />
            <RectangleSkeleton
              className="role-selector"
              width={"96px"}
              height={"8px"}
              borderRadius={"3px"}
            />
          </div>
        </StyledGroupMemberLoader>
      ))}
    </StyledGroupsLoader>
  );
};

export default GroupsLoader;
