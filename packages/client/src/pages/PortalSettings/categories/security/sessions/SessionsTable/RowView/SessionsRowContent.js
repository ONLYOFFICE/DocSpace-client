import styled, { css } from "styled-components";
import Text from "@docspace/components/text";
import Box from "@docspace/components/box";
import RowContent from "@docspace/components/row-content";
import { tablet, mobile } from "@docspace/components/utils/device";

const StyledRowContent = styled(RowContent)`
  .rowMainContainer {
    height: 100%;
    width: 100%;
  }

  @media ${tablet} {
    .row-main-container-wrapper {
      width: 100%;
      display: flex;
      justify-content: space-between;
      max-width: inherit;
    }
  }

  @media ${mobile} {
    .row-main-container-wrapper {
      justify-content: flex-start;
    }
  }

  .session-info-wrapper {
    min-width: 250px;
    .session-info {
      font-weight: 600;
      color: #a3a9ae;
      font-size: 12px;
    }

    .online {
      font-weight: 600;
      color: #35ad17;
      margin-left: 4px;
      font-size: 14px;
    }

    .offline {
      font-weight: 600;
      color: #a3a9ae;
      font-size: 14px;
      margin-left: 4px;
    }

    .username {
      font-weight: 600;
      color: #333333;
      font-size: 14px;
    }

    .additional-row-content {
      display: flex;
      align-items: center;
    }

    .browser,
    .city {
      margin-left: 4px;
    }

    .vr {
      margin: 0px 4px;
    }
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

  const contentData = [
    <Box key={userId} displayProp="flex" alignItems="center">
      <Box className="session-info-wrapper">
        <Box className="main-row-content">
          <div className="session-info username">
            {displayName}
            <span className={isOnline ? "online" : "offline"}>{status}</span>
          </div>
        </Box>

        <div className="additional-row-content">
          <Text className="session-info">
            {platform},
            <span className="browser">
              {browser}
              <span className="vr">{"|"}</span>
            </span>
          </Text>
          <Text className="session-info" truncate>
            {country},
            <span className="city">
              {city}
              <span className="vr">{"|"}</span>
            </span>
            <span>{ip}</span>
          </Text>
        </div>
      </Box>
    </Box>,
  ];

  return (
    <StyledRowContent sectionWidth={sectionWidth}>
      {contentData}
    </StyledRowContent>
  );
};

export default SessionsRowContent;
