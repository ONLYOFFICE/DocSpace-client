import { CircleSkeleton } from "../circle";
import { RectangleSkeleton } from "../rectangle";

import { StyledDataReassignmentLoader } from "./Dialog.styled";

export const DialogReassignmentSkeleton = () => {
  return (
    <StyledDataReassignmentLoader>
      <div className="user">
        <CircleSkeleton className="avatar" radius="40" x="40" y="40" />

        <div className="name">
          <RectangleSkeleton width="154" height="20" />
          <RectangleSkeleton width="113" height="20" />
        </div>
      </div>

      <div className="new-owner">
        <div className="new-owner_header">
          <RectangleSkeleton width="113" height="16" />
          <RectangleSkeleton width="253" height="20" />
        </div>

        <div className="new-owner_add">
          <RectangleSkeleton width="32" height="32" />
          <RectangleSkeleton width="113" height="20" />
        </div>
      </div>

      <div className="description">
        <RectangleSkeleton height="40" />
        <RectangleSkeleton width="223" height="20" />
        <RectangleSkeleton width="160" height="20" />
      </div>
    </StyledDataReassignmentLoader>
  );
};
