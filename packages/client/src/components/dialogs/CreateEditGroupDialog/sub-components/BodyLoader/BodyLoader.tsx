import React from "react";

import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { RowLoader } from "@docspace/shared/skeletons/selector";

import { StyledBodyLoader } from "../../CreateEditGroupDialog.styled";

export const BodyLoader = () => {
  return (
    <StyledBodyLoader>
      <div className="title-section">
        <RectangleSkeleton className="group-title" width="50px" />
        <RectangleSkeleton height="32px" />
      </div>
      <div className="manager-section">
        <RectangleSkeleton
          className="manager-title"
          height="16px"
          width="100px"
        />
        <RowLoader className="member-row" isMultiSelect isUser count={1} />
      </div>
      <div className="members-section">
        <RectangleSkeleton
          className="members-title"
          height="16px"
          width="100px"
        />
        <div className="add-member-container">
          <RectangleSkeleton height="32px" width="32px" />
          <RectangleSkeleton height="14px" width="100px" />
        </div>
        <RowLoader
          className="member-row"
          isContainer
          isMultiSelect
          isUser
          count={10}
        />
      </div>
    </StyledBodyLoader>
  );
};
