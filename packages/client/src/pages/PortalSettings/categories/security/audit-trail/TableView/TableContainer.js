/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useRef } from "react";
import { inject, observer } from "mobx-react";

import useViewEffect from "@docspace/ui-kit/hooks/useViewEffect";

import { TableContainer, TableBody } from "@docspace/ui-kit/components/table";

import TableRow from "./TableRow";
import TableHeader from "./TableHeader";

const TABLE_VERSION = "5";
const COLUMNS_SIZE = `auditColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelAuditTrailColumnsSize_ver-${TABLE_VERSION}`;

const Table = ({
  auditTrailUsers,
  sectionWidth,
  viewAs,
  setViewAs,
  theme,
  isSettingNotPaid,
  currentDeviceType,
  userId,
}) => {
  const ref = useRef(null);
  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  return auditTrailUsers && auditTrailUsers.length > 0 ? (
    <TableContainer forwardedRef={ref} useReactWindow={false}>
      <TableHeader
        sectionWidth={sectionWidth}
        containerRef={ref}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
      />
      <TableBody
        useReactWindow={false}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        itemHeight={48}
        filesLength={auditTrailUsers.length}
      >
        {auditTrailUsers.map((item) => (
          <TableRow
            theme={theme}
            key={item.id}
            item={item}
            isSettingNotPaid={isSettingNotPaid}
          />
        ))}
      </TableBody>
    </TableContainer>
  ) : (
    <div />
  );
};

export default inject(({ settingsStore, setup, userStore }) => {
  const { security, viewAs, setViewAs } = setup;
  const { theme, currentDeviceType } = settingsStore;
  const userId = userStore.user?.id;

  return {
    auditTrailUsers: security.auditTrail.users,
    theme,
    viewAs,
    setViewAs,
    currentDeviceType,
    userId,
  };
})(observer(Table));
