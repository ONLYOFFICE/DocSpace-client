import styled, { css } from "styled-components";
import Text from "@docspace/components/text";
import Box from "@docspace/components/box";
import RowContent from "@docspace/components/row-content";
import Avatar from "@docspace/components/avatar";

const StyledRowContent = styled(RowContent)`
  .rowMainContainer {
    height: 100%;
    width: 100%;
  }

  .avatar {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 10px;
          `
        : css`
            margin-right: 10px;
          `}
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

const SessionsRowContent = (props) => {
  const { sectionWidth, data } = props;

  const {
    avatar,
    displayName,
    status,
    platform,
    browser,
    country,
    city,
    ip,
    userId,
  } = data;

  const isOnline = status === "Online";

  const contentData = [
    <Box key={userId} displayProp="flex" alignItems="center">
      <Avatar
        className="avatar"
        userName={displayName}
        source={avatar}
        size={"small"}
      />
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
