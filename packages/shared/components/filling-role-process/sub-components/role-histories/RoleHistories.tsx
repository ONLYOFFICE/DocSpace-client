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
        "Common:HistorySubmissionDate",
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
