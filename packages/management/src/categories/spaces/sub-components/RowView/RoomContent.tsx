// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import ArrowIcon from "PUBLIC_DIR/images/arrow.react.svg?url";

import React from "react";
import { useTranslation } from "react-i18next";
import styled, { css } from "styled-components";
import { ReactSVG } from "react-svg";

import { RowContent } from "@docspace/shared/components/row-content";
import { Text } from "@docspace/shared/components/text";

import { getConvertedSize } from "@docspace/shared/utils/common";
import { TTheme } from "@docspace/shared/themes";

import { mobile } from "@docspace/shared/utils";
import { DeviceType } from "@docspace/shared/enums";

import { TPortals } from "SRC_DIR/types/spaces";
import { useStore } from "SRC_DIR/store";

const StyledRowContent = styled(RowContent)<{ isWizardCompleted: boolean }>`
  padding-bottom: 10px;

  .row-main-container-wrapper {
    display: flex;
    justify-content: flex-start;
  }

  .user-container-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;

    .arrow-icon > div,
    .arrow-icon > div > svg {
      width: 12px;
      height: 12px;
      path {
        fill: ${(props) => props.theme.color};
      }
    }

    ${(props) =>
      !props.isWizardCompleted &&
      css`
        .domain-text {
          color: ${({ theme }) => theme.management.textColor};
        }
      `}
  }

  .mainIcons {
    height: 20px;
  }

  .mainIcons:empty {
    height: 0px;
  }

  .spaces_row-current,
  .complete-setup {
    color: ${({ theme }) => theme.management.textColor};
  }

  @media ${mobile} {
    display: flex;
    align-items: center;

    .row-main-container-wrapper {
      flex-direction: column;
    }

    .mainIcons {
      align-self: flex-start;
    }
  }
`;

type TRoomContent = {
  item: TPortals;
  isCurrentPortal: boolean;
  theme: TTheme;
};

export const RoomContent = ({ item, isCurrentPortal, theme }: TRoomContent) => {
  const { t } = useTranslation(["Management", "Common", "Settings"]);
  const { settingsStore } = useStore();

  const { currentDeviceType } = settingsStore;

  const { roomAdminCount, usersCount, roomsCount, usedSize } =
    item?.quotaUsage || {
      roomAdminCount: null,
      usersCount: null,
      roomsCount: null,
    };
  const { customQuota } = item;

  const isMobileView = currentDeviceType === DeviceType.mobile;

  const maxStorage = customQuota && getConvertedSize(t, customQuota);
  const usedStorage = getConvertedSize(t, usedSize);

  const storageSpace =
    customQuota >= 0 ? `${usedStorage}/${maxStorage}` : `${usedStorage}`;

  const protocol = window?.location?.protocol;

  const onSpaceClick = () => {
    if (isMobileView) {
      window.open(`${protocol}//${item.domain}/`, "_blank");
    }
  };

  const isWizardCompleted = item.wizardSettings.completed;

  return (
    <StyledRowContent
      isWizardCompleted={isWizardCompleted}
      sectionWidth={620}
      sideColor={theme?.management?.sideColor}
      className="spaces_row-content"
    >
      <div className="user-container-wrapper" onClick={onSpaceClick}>
        <Text
          fontWeight={600}
          fontSize="14px"
          truncate={true}
          className="domain-text"
        >
          {`${item.domain}`}
        </Text>
        {currentDeviceType === DeviceType.mobile && (
          <ReactSVG src={ArrowIcon} className="arrow-icon" />
        )}
      </div>

      {isCurrentPortal ? (
        <Text
          fontSize="14px"
          fontWeight={600}
          truncate={true}
          className="spaces_row-current"
        >
          {t("CurrentSpace")}
        </Text>
      ) : !isWizardCompleted && isMobileView ? (
        <Text
          fontSize="12px"
          fontWeight={600}
          truncate={true}
          className="complete-setup"
        >
          {t("CompleteSetup")}
        </Text>
      ) : null}

      {isWizardCompleted ? (
        <Text fontSize="12px" as="div" fontWeight={600} truncate={true}>
          {`${t("PortalStats", {
            roomCount: roomsCount,
            userCount: roomAdminCount + usersCount,
            storageSpace,
          })}`}
        </Text>
      ) : (
        <Text
          fontSize="12px"
          fontWeight={600}
          truncate={true}
          className="complete-setup"
        >
          {t("CompleteSetup")}
        </Text>
      )}
    </StyledRowContent>
  );
};
