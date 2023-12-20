import React from "react";
import styled from "styled-components";

import RectangleSkeleton from "@docspace/components/skeletons/rectangle";
import CircleSkeleton from "@docspace/components/skeletons/circle";
import Text from "@docspace/components/text";

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

const Row = () => {
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

const ShareLoader = ({ t }) => {
  return (
    <StyledWrapper>
      <Text fontSize="14px" fontWeight={600} className="title-link">
        {t("GeneralAccessLink")}
      </Text>
      <Row />
      <div className="title">
        <RectangleSkeleton width="154px" height="16px" />
      </div>
      <Row />
    </StyledWrapper>
  );
};

export default ShareLoader;
