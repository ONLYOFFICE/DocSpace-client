import styled, { css } from "styled-components";
import { Text } from "@docspace/shared/components/text";
import { RowContent } from "@docspace/shared/components/row-content";

const StyledRowContent = styled(RowContent)`
  .online {
    font-weight: 600;
    color: ${(props) => props.theme.activeSessions.textOnlineColor};
    margin-left: 4px;
    font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
  }

  .offline {
    font-weight: 600;
    color: ${(props) => props.theme.activeSessions.tableCellColor};
    font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
    margin-left: 4px;
  }
`;

const SessionsRowContent = ({ sectionWidth, item }) => {
  const {
    displayName,

    status,
    platform,
    browser,
    country,
    city,
    ip,
    userId,
  } = item;

  const isOnline = status === "Online";
  const className = isOnline ? "online" : "offline";

  return (
    <StyledRowContent
      key={userId}
      sectionWidth={sectionWidth}
      sideColor={theme.activeSessions.tableCellColor}
    >
      <Text fontSize="14px" fontWeight="600">
        {displayName}
        <span className={className}>{status}</span>
      </Text>
      <></>
      <Text fontSize="12px" fontWeight="600">
        {platform}
        {` ${browser}`}
      </Text>
      <Text fontSize="12px" fontWeight="600">
        {country}
        {` ${city}`}
      </Text>
      <Text fontSize="12px" fontWeight="600" containerWidth="160px">
        {ip}
      </Text>
    </StyledRowContent>
  );
};

export default SessionsRowContent;
