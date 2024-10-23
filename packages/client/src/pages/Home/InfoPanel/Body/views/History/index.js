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

import React, {
  useState,
  useEffect,
  useRef,
  useTransition,
  useCallback,
  useContext,
} from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import { StyledHistoryList, StyledHistorySubtitle } from "../../styles/history";

import InfoPanelViewLoader from "@docspace/shared/skeletons/info-panel/body";
import ScrollbarContext from "@docspace/shared/components/scrollbar/custom-scrollbar/ScrollbarContext";
import HistoryItemLoader from "@docspace/shared/skeletons/info-panel/body/views/HistoryItemLoader";
import { getRelativeDateDay } from "./../../helpers/HistoryHelper";
import HistoryBlock from "./HistoryBlock";
import NoHistory from "../NoItem/NoHistory";
import ThirdPartyComponent from "./HistoryBlockContent/ThirdParty";

const History = ({
  t,
  historyWithFileList,
  selectedFolder,
  selectionHistory,
  infoPanelSelection,
  getInfoPanelItemIcon,
  fetchHistory,
  checkAndOpenLocationAction,
  openUser,
  isVisitor,
  isCollaborator,
  calendarDay,
  setCalendarDay,
  selectionHistoryTotal,
  fetchMoreHistory,
}) => {
  const scrollContext = useContext(ScrollbarContext);
  const scrollElement = scrollContext.parentScrollbar?.scrollerElement;

  const isMount = useRef(true);
  const abortControllerRef = useRef(new AbortController());

  const [isLoading, setIsLoading] = useState(false);
  const [isShowLoader, setIsShowLoader] = useState(false);

  const isThirdParty = infoPanelSelection?.providerId;

  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);
  const [currentHistory, setCurrentHistory] = useState(selectionHistory);

  let loading = false;

  const getHistory = async (item) => {
    if (!item?.id) return;
    if (isLoading) {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
    } else setIsLoading(true);

    if (isMount.current) {
      fetchHistory(abortControllerRef.current?.signal).finally(() => {
        if (isMount.current) setIsLoading(false);
      });
    }
  };

  useEffect(() => {
    if (selectionHistory !== currentHistory) {
      loading = false;
      setCurrentHistory(selectionHistory);
    }
  }, [selectionHistory]);

  useEffect(() => {
    scrollElement?.addEventListener("scroll", onScroll);

    return () => {
      scrollElement?.removeEventListener("scroll", onScroll);
    };
  }, [scrollElement, selectionHistory]);

  const onFetchMoreHistory = async () => {
    setIsLoadingNextPage(true);
    loading = true;
    await fetchMoreHistory();
    setIsLoadingNextPage(false);
  };

  const onCheckListScroll = () => {
    if (loading) return;
    const all = scrollElement.scrollHeight;
    const current = scrollElement.scrollTop;
    const more = all - (current + scrollElement.clientHeight) <= 10;

    if (more) onFetchMoreHistory();
  };

  const onCheckNextPage = useCallback(() => {
    if (!selectionHistory) return;
    let feedsRelatedLength = 0;

    selectionHistory.map(({ feeds }) => {
      feeds.map((feed) => {
        if (feed.related.length) feedsRelatedLength += feed.related.length;
      });

      feedsRelatedLength += feeds.length;
    });

    const hasNextItems = feedsRelatedLength < selectionHistoryTotal;

    return hasNextItems;
  }, [selectionHistory?.length, selectionHistoryTotal, selectionHistory]);

  const onScroll = useCallback(() => {
    if (!selectionHistory || loading) return;

    const hasNextPage = onCheckNextPage();

    if (hasNextPage) onCheckListScroll();
  }, [selectionHistory, loading]);
  useEffect(() => {
    if (!isMount.current || isThirdParty) return;

    getHistory(infoPanelSelection);
  }, [
    infoPanelSelection.id,
    infoPanelSelection.isFolder || infoPanelSelection.isRoom,
  ]);

  useEffect(() => {
    if (!calendarDay) return;

    const heightTitleRoom = 80;
    const heightDayWeek = 40;

    const historyListNode = document.getElementById("history-list-info-panel");
    if (!historyListNode) return;

    const scroll = historyListNode.closest(".scroller");
    if (!scroll) return;

    let dateCoincidingWithCalendarDay = null;

    selectionHistory.every((item) => {
      if (dateCoincidingWithCalendarDay) return false;

      item.feeds.every((feed) => {
        if (feed.date.slice(0, 10) === calendarDay) {
          dateCoincidingWithCalendarDay = feed.date;
        }
      });

      return true;
    });

    if (dateCoincidingWithCalendarDay) {
      const dayNode = historyListNode.getElementsByClassName(
        dateCoincidingWithCalendarDay,
      );
      if (!dayNode[0]) return;

      const y = dayNode[0].offsetTop - heightTitleRoom - heightDayWeek;
      scroll.scrollTo(0, y);
      setCalendarDay(null);

      return;
    }

    //If there are no entries in the history for the selected day
    const calendarDayModified = new Date(calendarDay);
    let nearestNewerDate = null;

    selectionHistory.every((item, indexItem) => {
      if (nearestNewerDate) return false;

      item.feeds.every((feed) => {
        const date = new Date(feed.date);

        //Stop checking all entries for one day
        if (date > calendarDayModified) return false;

        //Looking for the nearest new date
        if (date < calendarDayModified) {
          //If there are no nearby new entries in the post history, then scroll to the last one
          if (indexItem === 0) {
            nearestNewerDate = feed.date;
            return false;
          }

          nearestNewerDate = selectionHistory[indexItem - 1].feeds[0].date;
        }
      });

      return true;
    });

    if (!nearestNewerDate) return;

    const dayNode = historyListNode.getElementsByClassName(nearestNewerDate);
    if (!dayNode[0]) return;

    const y = dayNode[0].offsetTop - heightTitleRoom - heightDayWeek;
    scroll.scrollTo(0, y);
    setCalendarDay(null);
  }, [calendarDay]);

  useEffect(() => {
    const showLoaderTimer = setTimeout(() => setIsShowLoader(true), 500);

    return () => {
      clearTimeout(showLoaderTimer);
      abortControllerRef.current?.abort();
      isMount.current = false;
    };
  }, []);

  if (isThirdParty) return <ThirdPartyComponent />;

  if (!selectionHistory) {
    if (isShowLoader) return <InfoPanelViewLoader view="history" />;
    return null;
  }
  if (!selectionHistory?.length) return <NoHistory t={t} />;

  return (
    <>
      <StyledHistoryList id="history-list-info-panel">
        {selectionHistory.map(({ day, feeds }) => [
          <StyledHistorySubtitle key={day}>
            {getRelativeDateDay(t, feeds[0].date)}
          </StyledHistorySubtitle>,
          ...feeds.map((feed, i) => (
            <HistoryBlock
              key={`${feed.action.id}_${feed.date}_${i}`}
              t={t}
              feed={feed}
              selectedFolder={selectedFolder}
              infoPanelSelection={infoPanelSelection}
              getInfoPanelItemIcon={getInfoPanelItemIcon}
              checkAndOpenLocationAction={checkAndOpenLocationAction}
              openUser={openUser}
              isVisitor={isVisitor}
              isCollaborator={isCollaborator}
              withFileList={historyWithFileList}
              isLastEntity={i === feeds.length - 1 && !isLoadingNextPage}
            />
          )),
        ])}
      </StyledHistoryList>
      {isLoadingNextPage ? <HistoryItemLoader /> : <></>}
    </>
  );
};

export default inject(
  ({ settingsStore, filesActionsStore, infoPanelStore, userStore }) => {
    const {
      infoPanelSelection,
      fetchHistory,
      selectionHistory,
      selectionHistoryTotal,
      historyWithFileList,
      getInfoPanelItemIcon,
      openUser,
      calendarDay,
      setCalendarDay,
      fetchMoreHistory,
    } = infoPanelStore;
    const { culture } = settingsStore;

    const { checkAndOpenLocationAction } = filesActionsStore;

    const { user } = userStore;
    const isVisitor = user.isVisitor;
    const isCollaborator = user.isCollaborator;

    return {
      culture,
      selectionHistory,
      selectionHistoryTotal,
      historyWithFileList,
      infoPanelSelection,
      getInfoPanelItemIcon,
      fetchHistory,
      checkAndOpenLocationAction,
      openUser,
      isVisitor,
      isCollaborator,
      calendarDay,
      setCalendarDay,
      fetchMoreHistory,
    };
  },
)(withTranslation(["InfoPanel", "Common", "Translations"])(observer(History)));
