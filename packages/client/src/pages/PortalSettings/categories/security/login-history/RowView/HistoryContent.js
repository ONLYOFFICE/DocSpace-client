import React from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";

import { Text } from "@docspace/shared/components/text";
import { RowContent } from "@docspace/shared/components/row-content";
import { convertTime } from "@docspace/shared/utils/convertTime";

const StyledRowContent = styled(RowContent)`
  .row-main-container-wrapper {
    display: flex;
    justify-content: flex-start;
    width: min-content;
  }
  padding-bottom: 10px;
`;

const HistoryContent = ({ sectionWidth, item, locale }) => {
  const dateStr = convertTime(item.date, locale);

  return (
    <StyledRowContent
      sideColor="#A3A9AE"
      nameColor="#D0D5DA"
      sectionWidth={sectionWidth}
    >
      <div className="user-container-wrapper">
        <Text
          fontWeight={600}
          fontSize="14px"
          isTextOverflow={true}
          className="settings_unavailable"
        >
          {item.user}
        </Text>
      </div>

      <Text
        containerMinWidth="120px"
        fontSize="12px"
        fontWeight={600}
        truncate={true}
        color="#A3A9AE"
        className="settings_unavailable"
      >
        {dateStr}
      </Text>
      <Text
        fontSize="12px"
        as="div"
        fontWeight={600}
        className="settings_unavailable"
      >
        {item.action}
      </Text>
    </StyledRowContent>
  );
};

export default inject(({ auth }) => {
  const { culture } = auth.settingsStore;
  const { user } = auth.userStore;
  const locale = (user && user.cultureName) || culture || "en";

  return {
    locale,
  };
})(observer(HistoryContent));
