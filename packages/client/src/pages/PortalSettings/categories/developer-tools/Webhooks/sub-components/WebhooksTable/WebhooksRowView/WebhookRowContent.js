import React from "react";
import styled from "styled-components";

import { Text } from "@docspace/shared/components/text";
import { RowContent } from "@docspace/shared/components/row-content";
import { ToggleButton } from "@docspace/shared/components/toggle-button";

import StatusBadge from "../../StatusBadge";

import { isMobile, tablet } from "@docspace/shared/utils";

const StyledRowContent = styled(RowContent)`
  display: flex;
  padding-bottom: 10px;

  .row-main-container-wrapper {
    @media ${tablet} {
      width: 100%;
    }
  }

  .rowMainContainer {
    height: 100%;
    width: 100%;
  }

  .mainIcons {
    min-width: 76px;
    display: flex;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-items: center;
`;

const ToggleButtonWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-inline-start: -52px;
`;

const FlexWrapper = styled.div`
  display: flex;
`;

export const WebhookRowContent = ({
  sectionWidth,
  webhook,
  isChecked,
  handleToggleEnabled,
}) => {
  return (
    <StyledRowContent sectionWidth={sectionWidth}>
      <ContentWrapper>
        <FlexWrapper>
          <Text
            fontWeight={600}
            fontSize="14px"
            style={{ marginInlineEnd: "8px" }}
          >
            {webhook.name}
          </Text>
          <StatusBadge status={webhook.status} />
        </FlexWrapper>

        {!isMobile() && (
          <Text fontWeight={600} fontSize="12px" color="#A3A9AE">
            {webhook.uri}
          </Text>
        )}
      </ContentWrapper>

      <ToggleButtonWrapper>
        <ToggleButton
          className="toggle toggleButton"
          id="toggle id"
          isChecked={isChecked}
          onChange={handleToggleEnabled}
        />
      </ToggleButtonWrapper>
    </StyledRowContent>
  );
};
