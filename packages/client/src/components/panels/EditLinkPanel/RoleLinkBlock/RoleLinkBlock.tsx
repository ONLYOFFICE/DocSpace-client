// (c) Copyright Ascensio System SIA 2009-2025
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

import React from "react";

import { AccessRightSelect } from "@docspace/shared/components/access-right-select";
import { Text } from "@docspace/shared/components/text";
import { isMobile } from "@docspace/shared/utils";
import { DeviceType } from "@docspace/shared/enums";
import type { TOption } from "@docspace/shared/components/combobox";

import ArrowIcon from "PUBLIC_DIR/images/arrow.react.svg?url";

import { RoleLinkBlockWrapper } from "./RoleLinkBlock.styled";
import type { RoleLinkBlockProps } from "./RoleLinkBlock.types";

const RoleLinkBlock = ({
  t,
  onSelect,
  selectedOption,
  accessOptions = [],
  currentDeviceType,
}: RoleLinkBlockProps) => {
  const isMobileView = isMobile() || currentDeviceType === DeviceType.mobile;

  const directionX = isMobileView ? undefined : "right";

  const handleSelect = (option: TOption) => {
    onSelect?.(option);
  };

  return (
    <RoleLinkBlockWrapper>
      <Text fontSize="16px" fontWeight={700}>
        {t("SharingPanel:RoleForLink")}
      </Text>
      <AccessRightSelect
        // innerContainer
        // scaledOptions
        // manualY="16px"
        fillIcon
        onSelect={handleSelect}
        manualWidth="auto"
        fixedDirection
        type="descriptive"
        directionY="both"
        directionX={directionX}
        isDefaultMode={isMobileView}
        isMobileView={isMobileView}
        withBlur={isMobileView}
        isAside={isMobileView}
        withoutBackground={isMobileView}
        withBackground={!isMobileView}
        selectedOption={selectedOption}
        accessOptions={accessOptions}
        comboIcon={ArrowIcon}
        dataTestId="edit_link_panel_role_access_select"
      />
    </RoleLinkBlockWrapper>
  );
};

export default RoleLinkBlock;
