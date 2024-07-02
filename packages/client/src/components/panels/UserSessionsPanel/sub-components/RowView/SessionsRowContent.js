import { Text } from "@docspace/shared/components/text";
import { convertTime } from "@docspace/shared/utils/convertTime";
import { RowContent } from "@docspace/shared/components/row-content";

import styled from "styled-components";

const StyledRowContent = styled(RowContent)`
  .row-main-container-wrapper {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .date {
    font-size: 14px;
    font-weight: 600;
    color: ${(props) => props.theme.profile.activeSessions.tableCellColor};
    margin-left: 4px;
  }
`;

const SessionsRowContent = ({ item, sectionWidth }) => {
  const { id, platform, browser, country, city, date } = item;

  return (
    <StyledRowContent
      key={id}
      sectionWidth={sectionWidth}
      sideColor={theme.profile.activeSessions.tableCellColor}
    >
      <Text fontSize="14px" fontWeight="600" containerWidth="160px" truncate>
        {platform}, {browser?.split(".")[0] ?? ""}
        <span className="date">{convertTime(new Date(date))}</span>
      </Text>
      <></>
      {(country || city) && (
        <Text fontSize="12px" fontWeight="600">
          {country}
          {country && city && ` ${city}`}
        </Text>
      )}
    </StyledRowContent>
  );
};

export default SessionsRowContent;
