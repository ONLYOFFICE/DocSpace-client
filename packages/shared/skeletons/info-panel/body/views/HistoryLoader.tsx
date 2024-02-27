import React from "react";

import { RectangleSkeleton } from "@docspace/shared/skeletons";
import {
  StyledHistoryBlockLoader,
  StyledHistoryLoader,
  StyledHistorySubtitleLoader,
} from "../body.styled";

const HistoryLoader = () => {
  return (
    <StyledHistoryLoader>
      <StyledHistorySubtitleLoader>
        <RectangleSkeleton width="111px" height="16px" borderRadius="3px" />
        <RectangleSkeleton width="16px" height="16px" borderRadius="3px" />
      </StyledHistorySubtitleLoader>

      {[...Array(5).keys()].map((i) => (
        <StyledHistoryBlockLoader key={i}>
          <div className="content">
            <RectangleSkeleton
              className="avatar"
              width="32px"
              height="32px"
              borderRadius="50%"
            />
            <div className="message">
              <RectangleSkeleton
                width="107px"
                height="16px"
                borderRadius="3px"
              />
              <RectangleSkeleton
                width="176px"
                height="16px"
                borderRadius="3px"
              />
            </div>
            <RectangleSkeleton
              className="date"
              width="107px"
              height="16px"
              borderRadius="3px"
            />
          </div>
        </StyledHistoryBlockLoader>
      ))}
    </StyledHistoryLoader>
  );
};

export default HistoryLoader;
