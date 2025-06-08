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

import { inject, observer } from "mobx-react";
import styled from "styled-components";

import { TableRow, TableCell } from "@docspace/shared/components/table";
import { Text } from "@docspace/shared/components/text";
import { IconButton } from "@docspace/shared/components/icon-button";
import getCorrectDate from "@docspace/shared/utils/getCorrectDate";
import RemoveSessionSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
import TickSvgUrl from "PUBLIC_DIR/images/tick.svg?url";
import { globalColors } from "@docspace/shared/themes";
import { injectDefaultTheme } from "@docspace/shared/utils";

const StyledTableRow = styled(TableRow).attrs(injectDefaultTheme)`
  .session-platform {
    font-weight: 600;
    margin-inline-end: 5px;
  }

  .session-info {
    font-weight: 600;
    color: ${(props) => props.theme.profile.activeSessions.tableCellColor};
  }

  .divider {
    display: inline-block;
    height: 12px;
    width: 2px;
    background-color: ${(props) =>
      props.theme.profile.activeSessions.dividerColor};
    margin: -2px 5px;
  }

  .tick-icon {
    margin-inline-start: 8px;
  }

  .remove-cell {
    justify-content: flex-end;
  }
`;

const SessionsTableRow = (props) => {
  const {
    item,
    hideColumns,
    currentSession,
    setPlatformModalData,
    setLogoutDialogVisible,
    locale,
  } = props;

  const { platform, browser, date, country, city, ip } = item;

  const showRemoveIcon = currentSession !== item.id;
  const showTickIcon = currentSession === item.id;

  const onRemoveClick = () => {
    setLogoutDialogVisible(true);
    setPlatformModalData({
      id: item?.id,
      platform: item?.platform,
      browser: item?.browser,
    });
  };

  return (
    <StyledTableRow key={item.id} hideColumns={hideColumns}>
      <TableCell>
        <Text className="session-platform">{platform}</Text>
        <Text className="session-info">{`(${browser})`}</Text>
        {showTickIcon ? (
          <IconButton
            size={12}
            className="tick-icon"
            color={globalColors.tickColor}
            iconName={TickSvgUrl}
          />
        ) : null}
      </TableCell>

      <TableCell>
        <Text className="session-info" truncate>
          {getCorrectDate(locale, date)}
        </Text>
      </TableCell>

      <TableCell>
        <Text className="session-info" truncate>
          {country || city ? (
            <>
              {country}
              {country && city ? ", " : null}
              {city}
              <span className="divider" />
            </>
          ) : null}
          {ip}
        </Text>
      </TableCell>

      {showRemoveIcon ? (
        <TableCell className="remove-cell">
          <IconButton
            size={20}
            iconName={RemoveSessionSvgUrl}
            isClickable
            onClick={onRemoveClick}
          />
        </TableCell>
      ) : null}
    </StyledTableRow>
  );
};

export default inject(({ setup, settingsStore, userStore }) => {
  const { currentSession, setLogoutDialogVisible, setPlatformModalData } =
    setup;
  const { culture } = settingsStore;
  const { user } = userStore;
  const locale = (user && user.cultureName) || culture || "en";

  return {
    locale,
    currentSession,
    setLogoutDialogVisible,
    setPlatformModalData,
  };
})(observer(SessionsTableRow));
