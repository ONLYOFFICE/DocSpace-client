import React from "react";
import styled from "styled-components";

import { Base } from "@docspace/shared/themes";

import { RectangleSkeleton } from "@docspace/shared/skeletons";

const StyledHistoryLoader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
`;

const StyledSubtitleLoader = styled.div`
  width: 100%;
  padding: 8px 0 12px 0;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const StyledHistoryBlockLoader = styled.div`
  width: 100%;
  height: 70px;

  display: flex;
  align-items: center;
  border-bottom: ${(props) => `solid 1px ${props.theme.infoPanel.borderColor}`};

  .content {
    width: 100%;
    height: 38px;

    display: flex;
    flex-direction: row;
    gap: 8px;

    .avatar {
      min-height: 32px;
      min-width: 32px;
    }
    .message {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .date {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl"
          ? `margin-right: auto;`
          : `margin-left: auto;`}
    }
  }
`;

StyledHistoryBlockLoader.defaultProps = { theme: Base };

const HistoryLoader = ({}) => {
  return (
    <StyledHistoryLoader>
      <StyledSubtitleLoader>
        <RectangleSkeleton
          width={"111px"}
          height={"16px"}
          borderRadius={"3px"}
        />
        <RectangleSkeleton
          width={"16px"}
          height={"16px"}
          borderRadius={"3px"}
        />
      </StyledSubtitleLoader>

      {[...Array(5).keys()].map((i) => (
        <StyledHistoryBlockLoader key={i}>
          <div className="content">
            <RectangleSkeleton
              className="avatar"
              width={"32px"}
              height={"32px"}
              borderRadius={"50%"}
            />
            <div className="message">
              <RectangleSkeleton
                width={"107px"}
                height={"16px"}
                borderRadius={"3px"}
              />
              <RectangleSkeleton
                width={"176px"}
                height={"16px"}
                borderRadius={"3px"}
              />
            </div>
            <RectangleSkeleton
              className="date"
              width={"107px"}
              height={"16px"}
              borderRadius={"3px"}
            />
          </div>
        </StyledHistoryBlockLoader>
      ))}
    </StyledHistoryLoader>
  );
};

export default HistoryLoader;
