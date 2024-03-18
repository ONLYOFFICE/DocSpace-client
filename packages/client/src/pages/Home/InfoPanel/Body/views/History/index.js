// (c) Copyright Ascensio System SIA 2010-2024
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

import React, { useState, useEffect, useRef, useTransition } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import { StyledHistoryList, StyledHistorySubtitle } from "../../styles/history";

import InfoPanelViewLoader from "@docspace/shared/skeletons/info-panel/body";
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
      item?.requestToken,
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

  if (!selectionHistory) return <InfoPanelViewLoader view="history" />;
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
  },
)(withTranslation(["InfoPanel", "Common", "Translations"])(observer(History)));
