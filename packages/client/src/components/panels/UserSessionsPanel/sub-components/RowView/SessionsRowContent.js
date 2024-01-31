import { Text } from "@docspace/shared/components/text";
import { Box } from "@docspace/shared/components/box";
import { convertTime } from "@docspace/shared/utils/convertTime";
import { RowContent } from "@docspace/shared/components/row-content";
import { ReactSVG } from "react-svg";

import RemoveSessionSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
import styled from "styled-components";

const StyledRowContent = styled(RowContent)`
  .rowMainContainer {
    height: 100%;
    width: 100%;
    margin-right: 0px;
  }

  .row-main-container-wrapper {
    width: 100%;
  }

  .session-info-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .session-logout-icon {
    cursor: pointer;
    margin-left: 5px;
  }

  .session-content-wrapper {
    width: 100%;
    min-width: 150px;
  }

  .main-row-content {
    display: flex;
    align-items: center;

    .platform,
    .browser {
      font-size: 14px;
      color: #333;
      font-weight: 600;
      margin-right: 5px;
    }

    .date {
      font-size: 14px;
      font-weight: 600;
      color: #a3a9ae;
    }
  }

  .additional-row-content {
    display: flex;
    align-items: center;

    .country,
    .city {
      font-size: 12px;
      font-weight: 600;
      color: #a3a9ae;
    }

    .city {
      margin-left: 5px;
    }
  }
`;

const SessionsRowContent = ({
  item,
  sectionWidth,
  setSessionModalData,
  setLogoutDialogVisible,
}) => {
  const { date, platform, browser, country, city, userId } = item;

  const onClickDisable = () => {
    setLogoutDialogVisible(true);
    setSessionModalData({
      ...item,
      platform: item.platform,
      broser: item.browser,
    });
  };

  const contentData = [
    <Box key={userId} className="session-info-wrapper">
      <Box className="session-content-wrapper">
        <Box className="main-row-content">
          <Text className="platform">{platform},</Text>
          <Text className="browser">{browser}</Text>
          <Text className="date" truncate>
            {convertTime(date)}
          </Text>
        </Box>
        <Box className="additional-row-content">
          <Text className="country">{country},</Text>
          <Text className="city">{city}</Text>
        </Box>
      </Box>
      <Box className="session-logout-icon">
        <ReactSVG src={RemoveSessionSvgUrl} onClick={onClickDisable} />
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
