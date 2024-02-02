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
    return () => {
      abortControllerRef.current?.abort();
      isMount.current = false;
    };
  }, []);

  if (!selectionHistory) return <Loaders.InfoPanelViewLoader view="history" />;
  if (!selectionHistory?.length) return <NoHistory t={t} />;

  return (
    <StyledHistoryList>
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
    };
  }
)(withTranslation(["InfoPanel", "Common", "Translations"])(observer(History)));
