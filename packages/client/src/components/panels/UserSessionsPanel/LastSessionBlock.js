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

  .session-info-wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 10px 0px;
  }

  .session-info-row {
    display: contents;
  }

  .session-info-label {
    padding: 4px;
    font-size: 13px;

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 24px;
            padding-right: 0px;
          `
        : css`
            margin-right: 24px;
            padding-left: 0px;
          `}
  }

  .session-info-value {
    justify-self: start;
    font-weight: 600;
    padding: 4px;
    font-size: 13px;
    width: 100%;
    ::first-letter {
      text-transform: uppercase;
    }
  }

  .online {
    font-weight: 600;
    padding: 4px;
    font-size: 13px;
    width: 100%;
    color: ${(props) => props.theme.profile.activeSessions.textOnlineColor};
    ::first-letter {
      text-transform: uppercase;
    }
  }
`;

const LastSessionBlock = (props) => {
  const { t, sessionStatus, userData } = props;
  const { sessions } = userData;
  const { platform, browser, ip, city, country } = sessions;

  const isOnline = sessionStatus === "online";

  return (
    <StyledLastSessionBlock>
      <Text className="subtitle">{t("Profile:LastSession")}</Text>
      <Box className="session-info-wrapper">
        <div className="session-info-row">
          <Text className="session-info-label">{t("Common:Active")}</Text>
          <Text className={isOnline ? "online" : "session-info-value"}>
            {sessionStatus}
          </Text>
        </div>
        <div className="session-info-row">
          <Text className="session-info-label">{t("Common:Platform")}</Text>
          <Text className="session-info-value">{platform}</Text>
        </div>
        <div className="session-info-row">
          <Text className="session-info-label">{t("Common:Browser")}</Text>
          <Text className="session-info-value">
            {browser?.split(".")[0] ?? ""}
          </Text>
        </div>
        <div className="session-info-row">
          <Text className="session-info-label">{t("Common:Location")}</Text>
          <Text className="session-info-value" truncate>
            {(country || city) && (
              <>
                {country}
                {country && city && ", "}
                {`${city} `}
              </>
            )}
            {ip}
          </Text>
        </div>
      </Box>
    </StyledLastSessionBlock>
  );
};

export default LastSessionBlock;
