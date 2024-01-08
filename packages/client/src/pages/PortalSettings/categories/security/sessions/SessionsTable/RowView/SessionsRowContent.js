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

  .session-info {
    .username {
      font-size: 14px;
      font-weight: 600;
      color: #333333;
      span {
        color: #a3a9ae;
      }
    }
    .additional-row-content {
      display: flex;
      align-items: center;
    }

    .session-platform,
    .session-location,
    .session-ip {
      font-size: 12px;
      font-weight: 600;
      color: #a3a9ae;
    }

    .session-platform,
    .session-location {
      position: relative;
      span {
        :after {
          content: "";
          position: absolute;
          top: 2px;
          ${(props) =>
            props.theme.interfaceDirection === "rtl"
              ? css`
                  left: -7px;
                `
              : css`
                  right: -7px;
                `}
          width: 2px;
          height: 12px;
          background: ${(props) => props.theme.activeSessions.sortHeaderColor};
        }
      }
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-left: 6px;
            `
          : css`
              margin-right: 6px;
            `}
    }

    .session-location {
      margin: 0px 6px;
    }

    .session-ip {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: 6px;
            `
          : css`
              margin-left: 6px;
            `}
    }
  }
`;

const SessionsRowContent = (props) => {
  const {
    sectionWidth,
    avatar,
    displayName,
    status,
    platform,
    browser,
    country,
    city,
    ip,
    userId,
    rowRef,
  } = props;

  const isOnline = status === "Online";

  const contentData = [
    <Box key={userId} displayProp="flex" alignItems="center">
      <Avatar
        className="avatar"
        userName={displayName}
        source={avatar}
        size={"small"}
      />
      <Box className="session-info" ref={rowRef}>
        <Box className="main-row-content">
          <div className="username">
            {displayName} <span>{status}</span>
          </div>
        </Box>

        <Box className="additional-row-content">
          <div className="session-platform">
            {platform}, <span>{browser}</span>
          </div>
          <div className="session-location">
            {country}, <span>{city}</span>
          </div>
          <div className="session-ip">{ip}</div>
        </Box>
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
