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

import { decode } from "he";
import { DateTime } from "luxon";
import React, { useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import { classNames } from "../../../../utils";

import styles from "./RoleHistories.module.scss";
import type { RoleHistoryProps } from "./RoleHistories.types";
import { FillingFormStatusHistory } from "../../../../enums";

const RoleHistories = ({
  histories,
  className,
  stoppedBy,
}: RoleHistoryProps) => {
  const { t, i18n } = useTranslation("Common");

  const stoppedByUserName = stoppedBy ? decode(stoppedBy.displayName) : "";

  const historyTexts = useMemo(() => {
    return {
      [FillingFormStatusHistory.OpenedAtDate.toString()]: t(
        "Common:HistoryOpenedAtDate",
      ),
      [FillingFormStatusHistory.SubmissionDate.toString()]: t(
        "Common:HistorySubmittedPartDescription",
      ),
      [FillingFormStatusHistory.StopDate.toString()]: (
        <Trans
          t={t}
          i18nKey="HistoryStopDate"
          ns="Common"
          values={{ userName: stoppedByUserName }}
          components={{ 1: <strong title={stoppedByUserName} /> }}
        />
      ),
    };
  }, [t, stoppedByUserName]);

  return (
    <ul className={classNames(styles.roleHistory, className)}>
      {histories.map((history) => {
        const [key, value] = history;

        const date = DateTime.fromISO(value)
          .setLocale(i18n.language)
          .toLocaleString(DateTime.DATETIME_SHORT);

        const text = historyTexts[key];

        return (
          <li key={value} className={styles.roleHistoryItem}>
            <span className={styles.action}>{text}</span>
            <time className={styles.date} dateTime={value}>
              {date}
            </time>
          </li>
        );
      })}
    </ul>
  );
};

export default RoleHistories;
