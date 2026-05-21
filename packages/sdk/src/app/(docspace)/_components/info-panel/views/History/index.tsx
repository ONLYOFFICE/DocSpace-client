// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import InfoPanelViewLoader from "@docspace/shared/skeletons/info-panel/body";
import HistoryItemLoader from "@docspace/shared/skeletons/info-panel/body/views/HistoryItemLoader";
import {
  formatDate,
  getWeekdayName,
  isAfter,
  isBetween,
  isSameDay,
  now as dateNow,
  parseToDateTime,
  subtractFromDate,
} from "@docspace/ui-kit/utils/date";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import type { TTranslation } from "@docspace/shared/types";

import { useHistory } from "./useHistory";
import HistoryBlock from "./HistoryBlock";
import styles from "./History.module.scss";

const getRelativeDateDay = (
  t: TTranslation,
  date: string,
  locale: string,
) => {
  const given = parseToDateTime(date);
  if (!given) return "";

  const currentDate = dateNow();
  const weekAgo = subtractFromDate(currentDate, 1, "weeks");
  const halfYearAgo = subtractFromDate(currentDate, 6, "months");
  const yesterday = subtractFromDate(currentDate, 1, "days");

  if (isAfter(given, weekAgo)) {
    if (isSameDay(currentDate, given)) return t("Common:Today");
    if (isSameDay(yesterday, given)) return t("Common:Yesterday");

    const weekday = getWeekdayName(given.weekday, "long", locale);
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
  }

  if (isBetween(given, halfYearAgo, weekAgo)) {
    const shortDate = formatDate(given, "MMMM d", { locale });
    return shortDate.charAt(0).toUpperCase() + shortDate.slice(1);
  }

  const longDate = formatDate(given, "MMMM d, yyyy", { locale });
  return longDate.charAt(0).toUpperCase() + longDate.slice(1);
};

type HistoryProps = {
  selection: TFile | TFolder;
};

const History = ({ selection }: HistoryProps) => {
  const { t, i18n } = useTranslation(["Common"]);

  const {
    history,
    total,
    showLoading,
    isLoading,
    isFirstLoading,
    fetchHistory,
    fetchMoreHistory,
  } = useHistory({ selection });

  const loading = React.useRef(false);

  React.useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection.id]);

  React.useEffect(() => {
    loading.current = isLoading;
  }, [isLoading]);

  const hasNextPage = React.useCallback(() => {
    if (!history.length) return false;
    let count = 0;
    history.forEach(({ feeds }) => {
      feeds.forEach((feed) => {
        if (feed.related.length) count += feed.related.length;
      });
      count += feeds.length;
    });
    return count < total;
  }, [history, total]);

  const onScroll = React.useCallback(
    (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target || loading.current) return;
      if (!hasNextPage()) return;

      const remaining =
        target.scrollHeight - (target.scrollTop + target.clientHeight);
      if (remaining <= 10) {
        fetchMoreHistory();
      }
    },
    [fetchMoreHistory, hasNextPage],
  );

  React.useEffect(() => {
    const scrollEl = document.querySelector(
      "[data-info-panel-scroll]",
    ) as HTMLElement | null;

    scrollEl?.addEventListener("scroll", onScroll);
    return () => {
      scrollEl?.removeEventListener("scroll", onScroll);
    };
  }, [onScroll]);

  if (showLoading) return <InfoPanelViewLoader view="history" />;

  if (!history.length && !(isLoading || isFirstLoading)) {
    return (
      <div className={styles.noHistory}>
        <Text fontSize="13px">{t("Common:NoHistory")}</Text>
      </div>
    );
  }

  return (
    <>
      <div
        className={styles.historyList}
        id="history-list-info-panel"
        data-testid="info_panel_history"
      >
        {history.map(({ day, feeds }, idx) => [
          <div className={styles.historySubtitle} key={day}>
            {getRelativeDateDay(t, feeds[0].date, i18n.language)}
          </div>,
          ...feeds.map((feed, i) => (
            <HistoryBlock
              key={feed.id}
              feed={feed}
              isLastEntity={i === feeds.length - 1 ? !isLoading : false}
              dataTestId={`history_block_${idx}`}
            />
          )),
        ])}
      </div>
      {isLoading ? <HistoryItemLoader /> : null}
    </>
  );
};

export default History;
