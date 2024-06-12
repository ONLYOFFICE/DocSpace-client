import styled, { css } from "styled-components";
import { Text } from "@docspace/shared/components/text";
import { RowContent } from "@docspace/shared/components/row-content";

const StyledRowContent = styled(RowContent)`
  .online {
    font-weight: 600;
    color: ${(props) => props.theme.profile.activeSessions.textOnlineColor};
    margin-left: 4px;
    font-size: 14px;
    ::first-letter {
      text-transform: uppercase;
    }
  }

  .offline {
    font-weight: 600;
    color: ${(props) => props.theme.profile.activeSessions.tableCellColor};
    font-size: 14px;
    margin-left: 4px;
    ::first-letter {
      text-transform: uppercase;
    }
  }
`;

const SessionsRowContent = ({ t, item, fromDateAgo, sectionWidth }) => {
  const { id, displayName, status, sessions } = item;

  const { platform, browser, country, city, ip } = sessions;

  const isOnline = status === "online";

  return (
    <StyledRowContent
      key={id}
      sectionWidth={sectionWidth}
      sideColor={theme.profile.activeSessions.tableCellColor}
    >
      <Text fontSize="14px" fontWeight="600">
        {displayName}
        <span className={isOnline ? "online" : "offline"}>
          {t(`Common:${fromDateAgo}`)}
        </span>
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
