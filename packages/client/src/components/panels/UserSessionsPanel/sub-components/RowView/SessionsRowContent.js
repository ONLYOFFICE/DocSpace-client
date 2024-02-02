import { observer, inject } from "mobx-react";
import { Text } from "@docspace/shared/components/text";
import { convertTime } from "@docspace/shared/utils/convertTime";
import { RowContent } from "@docspace/shared/components/row-content";
import { ReactSVG } from "react-svg";

import RemoveSessionSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
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
    color: ${(props) => props.theme.activeSessions.tableCellColor};
    margin-left: 4px;
  }

  .mainIcons {
    height: 0px;
    cursor: pointer;
  }
`;

const SessionsRowContent = ({
  item,
  sectionWidth,
  setPlatformModalData,
  setLogoutDialogVisible,
}) => {
  const { id, platform, browser, country, city, date } = item;

  const onClickDisable = () => {
    setLogoutDialogVisible(true);
    setPlatformModalData({
      id: item.id,
      platform: item.platform,
      browser: item.browser,
    });
  };

  return (
    <StyledRowContent
      key={id}
      sectionWidth={sectionWidth}
      sideColor={theme.activeSessions.tableCellColor}
    >
      <Text fontSize="14px" fontWeight="600" containerWidth="160px" truncate>
        {platform}, {browser}
        <span className="date">{convertTime(date)}</span>
      </Text>
      <ReactSVG src={RemoveSessionSvgUrl} onClick={onClickDisable} />
      <Text fontSize="12px" fontWeight="600">
        {country}
        {` ${city}`}
      </Text>
    </StyledRowContent>
  );
};

export default inject(({ setup }) => {
  const { setPlatformModalData } = setup;

  return {
    setPlatformModalData,
  };
})(observer(SessionsRowContent));
