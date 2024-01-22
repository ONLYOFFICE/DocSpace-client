import React from "react";
import { useTranslation } from "react-i18next";
import { RowContent } from "@docspace/shared/components/row-content";
import { Text } from "@docspace/shared/components/text";
import styled, { css } from "styled-components";
import { isMobileOnly } from "react-device-detect";
import { getConvertedSize } from "@docspace/shared/utils/common";
import { TPortals } from "SRC_DIR/types/spaces";

const StyledRowContent = styled(RowContent)`
  padding-bottom: 10px;
  .row-main-container-wrapper {
    ${isMobileOnly &&
    css`
      margin-top: 14px;
    `}
    display: flex;
    justify-content: flex-start;
  }

  .mainIcons {
    height: 20px;
  }
`;

type TRoomContent = {
  item: TPortals;
  isCurrentPortal: boolean;
};

export const RoomContent = ({ item, isCurrentPortal }: TRoomContent) => {
  const { t } = useTranslation(["Management", "Common", "Settings"]);

  const { roomAdminCount, usersCount, storageSize, roomsCount, usedSize } =
    item?.quotaUsage || {
      roomAdminCount: null,
      usersCount: null,
      storageSize: null,
      roomsCount: null,
      usedSize: null,
    };

  const maxStorage = getConvertedSize(t, storageSize);
  const usedStorage = getConvertedSize(t, usedSize);

  return (
    <StyledRowContent
      sectionWidth={"620px"}
      sideColor="#A3A9AE"
      nameColor="#D0D5DA"
      className="spaces_row-content"
    >
      <div className="user-container-wrapper">
        <Text fontWeight={600} fontSize="14px" truncate={true}>
          {`${item.domain}`}
        </Text>
      </div>

      <Text
        containerMinWidth="120px"
        fontSize="14px"
        fontWeight={600}
        truncate={true}
        color="#A3A9AE"
        className="spaces_row-current"
      >
        {isCurrentPortal && t("CurrentSpace")}
      </Text>
      <Text fontSize="12px" as="div" fontWeight={600} truncate={true}>
        {`${t("PortalStats", {
          roomCount: roomsCount,
          userCount: roomAdminCount + usersCount,
          usedStorage,
          maxStorage,
        })}`}
      </Text>
    </StyledRowContent>
  );
};
