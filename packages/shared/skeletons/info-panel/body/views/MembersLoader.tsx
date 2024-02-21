import React from "react";

import { RectangleSkeleton } from "@docspace/shared/skeletons";
import {
  StyledMemberLoader,
  StyledMemberSubtitleLoader,
  StyledMembersLoader,
} from "../body.styled";

const MembersLoader = () => {
  return (
    <StyledMembersLoader>
      <StyledMemberSubtitleLoader>
        <RectangleSkeleton width="111px" height="16px" borderRadius="3px" />
        <RectangleSkeleton width="16px" height="16px" borderRadius="3px" />
      </StyledMemberSubtitleLoader>

      {[...Array(4).keys()].map((i) => (
        <StyledMemberLoader key={i}>
          <RectangleSkeleton
            className="avatar"
            width="32px"
            height="32px"
            borderRadius="50%"
          />
          <RectangleSkeleton width="212px" height="16px" borderRadius="3px" />
          <RectangleSkeleton
            className="role-selector"
            width="64px"
            height="20px"
            borderRadius="3px"
          />
        </StyledMemberLoader>
      ))}

      <StyledMemberSubtitleLoader className="pending_users">
        <RectangleSkeleton width="111px" height="16px" borderRadius="3px" />
        <RectangleSkeleton width="16px" height="16px" borderRadius="3px" />
      </StyledMemberSubtitleLoader>

      {[...Array(4).keys()].map((i) => (
        <StyledMemberLoader key={i}>
          <RectangleSkeleton
            className="avatar"
            width="32px"
            height="32px"
            borderRadius="50%"
          />
          <RectangleSkeleton width="212px" height="16px" borderRadius="3px" />
          <RectangleSkeleton
            className="role-selector"
            width="64px"
            height="20px"
            borderRadius="3px"
          />
        </StyledMemberLoader>
      ))}
    </StyledMembersLoader>
  );
};

export default MembersLoader;
