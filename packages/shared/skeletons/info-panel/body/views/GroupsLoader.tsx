import React from "react";

import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { StyledGroupMemberLoader, StyledGroupsLoader } from "../body.styled";

const GroupsLoader = () => {
  return (
    <StyledGroupsLoader>
      {[...Array(5).keys()].map((i) => (
        <StyledGroupMemberLoader key={i}>
          <RectangleSkeleton
            className="avatar"
            width="32px"
            height="32px"
            borderRadius="50%"
          />
          <div className="user-info">
            <RectangleSkeleton width="128px" height="12px" borderRadius="3px" />
            <RectangleSkeleton
              className="role-selector"
              width="96px"
              height="8px"
              borderRadius="3px"
            />
          </div>
        </StyledGroupMemberLoader>
      ))}
    </StyledGroupsLoader>
  );
};

export default GroupsLoader;
