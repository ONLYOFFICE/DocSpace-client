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

import { useEffect, useRef, useCallback, use } from "react";
import { useTranslation } from "react-i18next";

import { TRoom } from "@docspace/shared/api/rooms/types";
import { TFile, TFolder } from "@docspace/shared/api/files/types";
import InfoPanelViewLoader from "@docspace/shared/skeletons/info-panel/body";
import ScrollbarContext from "@docspace/shared/components/scrollbar/custom-scrollbar/ScrollbarContext";
import HistoryItemLoader from "@docspace/shared/skeletons/info-panel/body/views/HistoryItemLoader";
import { LANGUAGE } from "@docspace/shared/constants";
import { TTranslation } from "@docspace/shared/types";
import { getCookie } from "@docspace/shared/utils";
import {
  parseToDateTime,
  now as dateNow,
  subtractFromDate,
  isAfter,
  isBetween,
  formatDate,
  getWeekdayName,
  isSameDay,
} from "@docspace/shared/utils/date";

import { useHistory } from "../FilesView/hooks/useHistory";

import NoHistory from "../../sub-components/NoItem/NoHistory";

import HistoryBlock from "./HistoryBlock";
import styles from "./History.module.scss";
import { useSocket } from "./hooks/useSocket";
import { HistorySelectionProvider } from "./providers/HistorySelection.provider";

export const getRelativeDateDay = (t: TTranslation, date: string) => {
  const locale = getCookie(LANGUAGE) || "en";

  const given = parseToDateTime(date)?.setZone(window.timezone);
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
  infoPanelSelection: TRoom | TFile | TFolder;

  history: ReturnType<typeof useHistory>["history"];
  total: ReturnType<typeof useHistory>["total"];
  showLoading: ReturnType<typeof useHistory>["showLoading"];
  isLoading: ReturnType<typeof useHistory>["isLoading"];
  isFirstLoading: ReturnType<typeof useHistory>["isFirstLoading"];
  fetchHistory: ReturnType<typeof useHistory>["fetchHistory"];
  fetchMoreHistory: ReturnType<typeof useHistory>["fetchMoreHistory"];
};

const History = ({
  infoPanelSelection,

  history,
  total,
  showLoading,
  isLoading,
  isFirstLoading,
  fetchHistory,
  fetchMoreHistory,
}: HistoryProps) => {
  const { t } = useTranslation(["InfoPanel", "Common", "Translations"]);

  const scrollContext = use(ScrollbarContext);
  const scrollElement = scrollContext.parentScrollbar?.scrollerElement;

  const loading = useRef(false);

  useSocket({
    selectionId: infoPanelSelection.id,
    infoPanelSelectionType:
      ("isRoom" in infoPanelSelection && infoPanelSelection.isRoom) ||
      ("isFolder" in infoPanelSelection && infoPanelSelection.isFolder)
        ? "folder"
        : "file",
    fetchHistory,
  });

  const onCheckListScroll = () => {
    if (loading.current) return;
    const all = scrollElement.scrollHeight;
    const current = scrollElement.scrollTop;
    const more = all - (current + scrollElement.clientHeight) <= 10;

    if (more) fetchMoreHistory();
  };

  const onCheckNextPage = useCallback(() => {
    if (!history.length) return;

    let feedsRelatedLength = 0;

    history.forEach(({ feeds }) => {
      feeds.forEach((feed) => {
        if (feed.related.length) feedsRelatedLength += feed.related.length;
      });

      feedsRelatedLength += feeds.length;
    });

    const hasNextItems = feedsRelatedLength < total;

    return hasNextItems;
  }, [history, total]);

  const onScroll = useCallback(() => {
    if (!history || loading.current) return;

    const hasNextPage = onCheckNextPage();

    if (hasNextPage) onCheckListScroll();
  }, [history, onCheckNextPage]);

  useEffect(() => {
    scrollElement?.addEventListener("scroll", onScroll);

    return () => {
      scrollElement?.removeEventListener("scroll", onScroll);
    };
  }, [scrollElement, onScroll]);

  if (showLoading) return <InfoPanelViewLoader view="history" />;

  if (!history.length && !(isLoading || isFirstLoading)) return <NoHistory />;

  return (
    <HistorySelectionProvider selection={infoPanelSelection}>
      <div
        className={styles.historyList}
        id="history-list-info-panel"
        data-testid="info_panel_history"
      >
        {history.map(({ day, feeds }, idx) => [
          <div className={styles.historySubtitle} key={day}>
            {getRelativeDateDay(t, feeds[0].date)}
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
    </HistorySelectionProvider>
  );
};

export default History;
