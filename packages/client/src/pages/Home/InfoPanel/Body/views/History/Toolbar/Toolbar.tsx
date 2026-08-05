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

import { useEffect, type FC } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { parseToDateTime } from "@docspace/ui-kit/utils/date";
import type { TFolderLogReportDateRange } from "@docspace/shared/api/files/types";

import { DateFilter } from "./sub-components/DateFilter";
import { ExportMenu } from "./sub-components/ExportMenu";
import type {
  HistoryToolbarProps,
  InjectedHistoryToolbarProps,
} from "./Toolbar.types";
import styles from "./Toolbar.module.scss";

const HistoryToolbar = ({
  roomId,
  canExportHistory,
  roomCreationDate,
  selectedDay,
  onSelectDay,

  getRoomHistoryReport,
  markRoomHistoryReportPageLeft,
  resetRoomHistoryReportPageLeft,
  isRoomHistoryReportDownloading,
  setIsScrollLocked,
}: HistoryToolbarProps & InjectedHistoryToolbarProps) => {
  const { i18n } = useTranslation();

  // A report that finishes while the user is away must not steal the tab, but
  // coming back before it finishes makes the auto-open wanted again
  useEffect(() => {
    resetRoomHistoryReportPageLeft();

    return () => markRoomHistoryReportPageLeft();
  }, [markRoomHistoryReportPageLeft, resetRoomHistoryReportPageLeft]);

  const onExportHistory = (dateRange?: TFolderLogReportDateRange) => {
    getRoomHistoryReport(roomId, dateRange);
  };

  const roomCreatedDate = parseToDateTime(roomCreationDate);

  return (
    <div className={styles.toolbar} data-testid="info_history_toolbar">
      <DateFilter
        selectedDay={selectedDay}
        earliestDate={roomCreatedDate}
        locale={i18n.language}
        onSelectDay={onSelectDay}
        setIsScrollLocked={setIsScrollLocked}
      />

      {canExportHistory ? (
        <ExportMenu
          key={roomId}
          isReportGenerating={isRoomHistoryReportDownloading}
          earliestDate={roomCreatedDate}
          locale={i18n.language}
          onExport={onExportHistory}
        />
      ) : null}
    </div>
  );
};

export default inject<TStore, HistoryToolbarProps, InjectedHistoryToolbarProps>(
  ({ infoPanelStore }: TStore) => {
    const {
      getRoomHistoryReport,
      markRoomHistoryReportPageLeft,
      resetRoomHistoryReportPageLeft,
      isRoomHistoryReportDownloading,
      setIsScrollLocked,
    } = infoPanelStore;

    return {
      getRoomHistoryReport,
      markRoomHistoryReportPageLeft,
      resetRoomHistoryReportPageLeft,
      isRoomHistoryReportDownloading,
      setIsScrollLocked,
    };
  },
)(observer(HistoryToolbar as FC<HistoryToolbarProps>));
