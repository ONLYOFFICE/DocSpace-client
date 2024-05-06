import styled, { css } from "styled-components";
import { Box } from "@docspace/shared/components/box";
import { Text } from "@docspace/shared/components/text";

const StyledLastSessionBlock = styled.div`
  padding: 0px 20px;

  .subtitle {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .online {
    color: ${(props) => props.theme.profile.activeSessions.textOnlineColor};
  }

  .session-info-wrapper {
    display: flex;
    align-items: center;

    .session-info-left-container {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-left: 24px;
            `
          : css`
              margin-right: 24px;
            `}
      p {
        padding: 8px;
        font-size: 13px;
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                padding-right: 0px;
              `
            : css`
                padding-left: 0px;
              `}
      }
    }

    .session-info-right-container {
      p {
        font-weight: 600;
        padding: 8px;
        font-size: 13px;
      }
    }
  }
`;

const LastSessionBlock = (props) => {
  const { t, data } = props;
  const { status, platform, browser, ip, country, city } = data;

  const isOnline = status === "Online";

  return (
    <StyledLastSessionBlock>
      <Text className="subtitle">{t("Profile:LastSession")}</Text>
      <Box className="session-info-wrapper">
        <div className="session-info-left-container">
          <Text>{t("Common:Active")}</Text>
          <Text>{t("Common:Platform")}</Text>
          <Text>{t("Common:Browser")}</Text>
          <Text>{t("Common:IpAddress")}</Text>
          <Text>{t("Common:Country")}</Text>
          <Text>{t("Common:City")}</Text>
        </div>
        <div className="session-info-right-container">
          <Text className={isOnline && "online"}>{status}</Text>
          <Text>{platform}</Text>
          <Text>{browser}</Text>
          <Text>{ip}</Text>
          <Text>{country}</Text>
          <Text>{city}</Text>
        </div>
      </Box>
    </StyledLastSessionBlock>
  );
};

export default LastSessionBlock;
