import styled, { css } from "styled-components";
import { Text } from "@docspace/shared/components/text";
import { RowContent } from "@docspace/shared/components/row-content";

const StyledRowContent = styled(RowContent)`
  .online {
    font-weight: 600;
    color: ${(props) => props.theme.profile.activeSessions.textOnlineColor};
    margin-left: 4px;
    font-size: 14px;
  }

  .offline {
    font-weight: 600;
    color: ${(props) => props.theme.profile.activeSessions.tableCellColor};
    font-size: 14px;
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
      sideColor={theme.profile.activeSessions.tableCellColor}
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

      {(country || city) && (
        <Text fontSize="12px" fontWeight="600">
          {country}
          {country && city && ` ${city}`}
        </Text>
      )}

      <Text fontSize="12px" fontWeight="600" containerWidth="160px">
        {ip}
      </Text>
    </StyledRowContent>
  );
};

export default SessionsRowContent;
