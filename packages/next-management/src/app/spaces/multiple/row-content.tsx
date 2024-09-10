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

import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";

import { Text } from "@docspace/shared/components/text";
import { getConvertedSize } from "@docspace/shared/utils/common";
import { globalColors } from "@docspace/shared/themes";
import { DeviceType } from "@docspace/shared/enums";

import useDeviceType from "@/hooks/useDeviceType";
import { StyledRowContent } from "./multiple.styled";

export const RowContent = ({ item, tenantAlias }) => {
  const { t } = useTranslation(["Management", "Common", "Settings"]);
  const { currentDeviceType } = useDeviceType();

  const { roomAdminCount, usersCount, roomsCount, usedSize } =
    item?.quotaUsage || {
      roomAdminCount: null,
      usersCount: null,
      roomsCount: null,
    };
  const { customQuota } = item;

  const maxStorage = customQuota && getConvertedSize(t, customQuota);
  const usedStorage = getConvertedSize(t, usedSize);

  const storageSpace =
    customQuota >= 0 ? `${usedStorage}/${maxStorage}` : `${usedStorage}`;

  const isCurrentPortal = tenantAlias === item.portalName;
  const protocol = window?.location?.protocol;

  const onSpaceClick = () => {
    if (currentDeviceType === DeviceType.mobile) {
      window.open(`${protocol}//${item.domain}/`, "_blank");
    }
  };

  return (
    <StyledRowContent
      sectionWidth={"620px"}
      sideColor={globalColors.gray}
      nameColor={globalColors.grayStrong}
      className="spaces_row-content"
    >
      <div className="user-container-wrapper" onClick={onSpaceClick}>
        <Text fontWeight={600} fontSize="14px" truncate={true}>
          {`${item.domain}`}
        </Text>
        {currentDeviceType === DeviceType.mobile && (
          <ReactSVG src={ArrowIcon} className="arrow-icon" />
        )}
      </div>

      <Text
        containerMinWidth="120px"
        fontSize="14px"
        fontWeight={600}
        truncate={true}
        color={globalColors.gray}
        className="spaces_row-current"
      >
        {isCurrentPortal && t("CurrentSpace")}
      </Text>
      <Text fontSize="12px" as="div" fontWeight={600} truncate={true}>
        {`${t("PortalStats", {
          roomCount: roomsCount,
          userCount: roomAdminCount + usersCount,
          storageSpace,
        })}`}
      </Text>
    </StyledRowContent>
  );
};

