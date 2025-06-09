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
import { inject, observer } from "mobx-react";
import styled from "styled-components";

import { Text } from "@docspace/shared/components/text";
import { RowContent } from "@docspace/shared/components/rows";
import getCorrectDate from "@docspace/shared/utils/getCorrectDate";

import { UnavailableStyles } from "../../../../utils/commonSettingsStyles";

const StyledRowContent = styled(RowContent)`
  padding-bottom: 10px;
  .user-container-wrapper {
    p {
      color: ${(props) =>
        props.theme.client.settings.security.auditTrail.nameColor};
    }
  }
  .mainIcons {
    p {
      color: ${(props) =>
        props.theme.client.settings.security.auditTrail.sideColor};
    }
  }
  .row-main-container-wrapper {
    display: flex;
    justify-content: flex-start;
  }

  ${(props) => props.isSettingNotPaid && UnavailableStyles}
`;

const AuditContent = ({
  sectionWidth,
  item,
  isSettingNotPaid,
  locale,
  theme,
}) => {
  const dateStr = getCorrectDate(locale, item.date);

  return (
    <StyledRowContent
      sideColor={theme.client.settings.security.auditTrail.sideColor}
      nameColor={theme.client.settings.security.auditTrail.nameColor}
      sectionWidth={sectionWidth}
      isSettingNotPaid={isSettingNotPaid}
    >
      <div className="user-container-wrapper">
        <Text fontWeight={600} fontSize="14px" className="settings_unavailable">
          {item.user}
        </Text>
      </div>

      <Text
        containerMinWidth="120px"
        fontSize="12px"
        fontWeight={600}
        truncate
        className="settings_unavailable"
      >
        {dateStr}
      </Text>
      <Text
        fontSize="12px"
        as="div"
        fontWeight={600}
        className="settings_unavailable"
      >
        {`${item.context ? `${item.context} |` : ""} ${item.action}`}
      </Text>
    </StyledRowContent>
  );
};

export default inject(({ settingsStore, userStore }) => {
  const { culture, theme } = settingsStore;
  const { user } = userStore;
  const locale = (user && user.cultureName) || culture || "en";

  return {
    locale,
    theme,
  };
})(observer(AuditContent));
