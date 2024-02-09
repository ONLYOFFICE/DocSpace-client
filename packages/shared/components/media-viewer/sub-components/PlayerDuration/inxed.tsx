import React from "react";
import styled from "styled-components";

import { mobile } from "@docspace/shared/utils";
import { formatTime } from "../../MediaViewer.utils";

const PlayerDurationWrapper = styled.div`
  width: 102px;
  color: #fff;
  user-select: none;
  font-size: 12px;
  font-weight: 700;

  margin-left: 10px;

  @media ${mobile} {
    margin-left: 0;
  }
`;

type PlayerDurationProps = {
  currentTime: number;
  duration: number;
};

export const PlayerDuration = ({
  currentTime,
  duration,
}: PlayerDurationProps) => {
  return (
    <PlayerDurationWrapper>
      <time>{formatTime(currentTime)}</time> /{" "}
      <time>{formatTime(duration)}</time>
    </PlayerDurationWrapper>
  );
};
