import React from "react";
import styled from "styled-components";

import { Text } from "../../components/text";
import { TTranslation } from "../../types";
import { RectangleSkeleton, CircleSkeleton } from "../index";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;

  .title {
    padding-top: 20px;
    padding-bottom: 12px;
  }

  .title-link {
    margin-bottom: 12px;
    line-height: 16px;
    color: #a3a9ae;
  }
`;

const StyledRow = styled.div`
  padding: 16px 0;
  display: flex;
  gap: 8px;
  align-items: center;

  .row {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .actions {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-left: auto;
  }
`;

export const RowSkeleton = () => {
  return (
    <StyledRow>
      <CircleSkeleton x="16" y="16" radius="16" width="32" height="32" />
      <div className="row">
        <RectangleSkeleton width="161px" height="16px" />
        <RectangleSkeleton width="119px" height="16px" />
      </div>
      <div className="actions">
        <RectangleSkeleton width="16px" height="16px" />
        <RectangleSkeleton width="42px" height="28px" />
      </div>
    </StyledRow>
  );
};

interface ShareSkeletonProps {
  t: TTranslation;
}

const ShareSkeleton = ({ t }: ShareSkeletonProps) => {
  return (
    <StyledWrapper>
      <Text fontSize="14px" fontWeight={600} className="title-link">
        {t("GeneralAccessLink")}
      </Text>
      <RowSkeleton />
      <div className="title">
        <RectangleSkeleton width="154px" height="16px" />
      </div>
      <RowSkeleton />
    </StyledWrapper>
  );
};

export default ShareSkeleton;
