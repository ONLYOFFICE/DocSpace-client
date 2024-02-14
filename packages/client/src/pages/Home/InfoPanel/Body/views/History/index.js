import React, { useState, useEffect, useRef, useTransition } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import { StyledHistoryList, StyledHistorySubtitle } from "../../styles/history";

import Loaders from "@docspace/common/components/Loaders";
import { parseHistory } from "./../../helpers/HistoryHelper";
import HistoryBlock from "./HistoryBlock";
import NoHistory from "../NoItem/NoHistory";

const History = ({
  t,
  historyWithFileList,
  selectedFolder,
  selectionHistory,
  setSelectionHistory,
  infoPanelSelection,
  getInfoPanelItemIcon,
  getHistory,
  checkAndOpenLocationAction,
  openUser,
  isVisitor,
  isCollaborator,
  calendarDay,
  setCalendarDay,
}) => {
  const isMount = useRef(true);
  const abortControllerRef = useRef(new AbortController());

  const [isPending, startTransition] = useTransition();

  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = async (item) => {
    if (!item?.id) return;
    if (isLoading) {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
    } else setIsLoading(true);

    let module = "files";
    if (infoPanelSelection.isRoom) module = "rooms";
    else if (infoPanelSelection.isFolder) module = "folders";

    getHistory(
      module,
      item.id,
      abortControllerRef.current?.signal,
      item?.requestToken
    )
      .then((data) => {
        if (isMount.current)
          startTransition(() => {
            const parsedHistory = parseHistory(t, data);
            setSelectionHistory(parsedHistory);
          });
      })
      .catch((err) => {
        if (err.message !== "canceled") console.error(err);
      })
      .finally(() => {
        if (isMount.current) setIsLoading(false);
      });
  };

  useEffect(() => {
    if (!isMount.current) return;
    fetchHistory(infoPanelSelection);
  }, [infoPanelSelection.id]);

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
        if (feed.json.ModifiedDate.slice(0, 10) === calendarDay) {
          dateCoincidingWithCalendarDay = feed.json.ModifiedDate;
        }
      });

      return true;
    });

    if (dateCoincidingWithCalendarDay) {
      const dayNode = historyListNode.getElementsByClassName(
        dateCoincidingWithCalendarDay
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
        const date = new Date(feed.json.ModifiedDate);

        //Stop checking all entries for one day
        if (date > calendarDayModified) return false;

        //Looking for the nearest new date
        if (date < calendarDayModified) {
          //If there are no nearby new entries in the post history, then scroll to the last one
          if (indexItem === 0) {
            nearestNewerDate = feed.json.ModifiedDate;
            return false;
          }

          nearestNewerDate =
            selectionHistory[indexItem - 1].feeds[0].json.ModifiedDate;
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
    return () => {
      abortControllerRef.current?.abort();
      isMount.current = false;
    };
  }, []);

  if (!selectionHistory) return <Loaders.InfoPanelViewLoader view="history" />;
  if (!selectionHistory?.length) return <NoHistory t={t} />;

  return (
    <StyledHistoryList id="history-list-info-panel">
      {selectionHistory.map(({ day, feeds }) => [
        <StyledHistorySubtitle key={day}>{day}</StyledHistorySubtitle>,
        ...feeds.map((feed, i) => (
          <HistoryBlock
            key={feed.json.Id}
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
            isLastEntity={i === feeds.length - 1}
          />
        )),
      ])}
    </StyledHistoryList>
  );
};

export default inject(
  ({
    settingsStore,
    filesStore,
    filesActionsStore,
    infoPanelStore,
    userStore,
  }) => {
    const {
      infoPanelSelection,
      selectionHistory,
      setSelectionHistory,
      historyWithFileList,
      getInfoPanelItemIcon,
      openUser,
      calendarDay,
      setCalendarDay,
    } = infoPanelStore;
    const { personal, culture } = settingsStore;

    const { getHistory } = filesStore;
    const { checkAndOpenLocationAction } = filesActionsStore;

    const { user } = userStore;
    const isVisitor = user.isVisitor;
    const isCollaborator = user.isCollaborator;

    return {
      personal,
      culture,
      selectionHistory,
      setSelectionHistory,
      historyWithFileList,
      infoPanelSelection,
      getInfoPanelItemIcon,
      getHistory,
      checkAndOpenLocationAction,
      openUser,
      isVisitor,
      isCollaborator,
      calendarDay,
      setCalendarDay,
    };
  }
)(withTranslation(["InfoPanel", "Common", "Translations"])(observer(History)));
