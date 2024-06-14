import { useEffect } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { mobile, tablet } from "@docspace/shared/utils";
import SessionsLoader from "@docspace/shared/skeletons/sessions";

import styled from "styled-components";

import { MainContainer } from "../StyledSecurity";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";
import SessionsTable from "./SessionsTable";

import {
  LogoutSessionDialog,
  LogoutAllSessionDialog,
  DisableUserDialog,
} from "SRC_DIR/components/dialogs";

const DownLoadWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  position: sticky;
  bottom: 0;
  background-color: ${({ theme }) => theme.backgroundColor};

  @media ${mobile} {
    position: fixed;
    padding-inline: 16px;
    inset-inline: 0;
    margin-bottom: 8px;
  }

  .download-report_button {
    width: auto;
    height: auto;
    font-size: 13px;
    line-height: 20px;
    padding-top: 5px;
    padding-bottom: 5px;

    @media ${tablet} {
      font-size: 14px;
      line-height: 16px;
      padding-top: 11px;
      padding-bottom: 11px;
    }

    @media ${mobile} {
      width: 100%;
    }
  }

  .download-report_description {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;

    height: 16px;

    margin: 0;
    color: ${(props) =>
      props.theme.client.settings.security.auditTrail
        .downloadReportDescriptionColor};
  }

  @media ${mobile} {
    flex-direction: column-reverse;
  }
`;

const Sessions = ({
  t,
  allSessions,
  sessionsData,
  dataFromSocket,
  displayName,
  clearSelection,
  setDataFromSocket,
  updateAllSessions,
  platformData,
  selection,
  bufferSelection,
  fetchData,
  isLoading,
  viewAs,
  setViewAs,
  socketHelper,
  currentDeviceType,
  disableDialogVisible,
  logoutDialogVisible,
  logoutAllDialogVisible,
  setDisableDialogVisible,
  setLogoutDialogVisible,
  setLogoutAllDialogVisible,
  onClickLogoutAllSessions,
  onClickLogoutAllExceptThis,
  onClickRemoveSession,
  updateUserStatus,
  isSessionsLoaded,
}) => {
  useEffect(() => {
    socketHelper.emit({
      command: "subscribe",
      data: { roomParts: "statuses-in-portal" },
    });

    socketHelper.emit({
      command: "getSessionsInPortal",
    });

    socketHelper.on("statuses-in-portal", (data) => {
      setDataFromSocket(data);
    });

    fetchData();

    return () => {
      clearSelection();
    };
  }, []);

  useEffect(() => {
    updateAllSessions(sessionsData, dataFromSocket);
  }, [sessionsData, dataFromSocket]);

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  const getIdFromConnections = (connections) => connections?.[0]?.id;

  const idFromSelection =
    selection.length > 0
      ? getIdFromConnections(selection[0].connections)
      : undefined;

  const idFromBufferSelection = bufferSelection
    ? getIdFromConnections(bufferSelection.connections)
    : undefined;

  const exceptId = idFromSelection || idFromBufferSelection;
  const userIdsFromSelection = selection.map((user) => user.id);

  const userIds =
    bufferSelection?.id !== undefined
      ? [bufferSelection.id, ...userIdsFromSelection]
      : [...userIdsFromSelection];

  // console.log("allSessions", JSON.parse(JSON.stringify(allSessions)));
  // console.log("sessionsData", JSON.parse(JSON.stringify(sessionsData)));
  // console.log("connections", JSON.parse(JSON.stringify(connections)));
  // console.log("userLastSession", JSON.parse(JSON.stringify(userLastSession)));

  if (!isSessionsLoaded) return <SessionsLoader viewAs={viewAs} />;

  return (
    <MainContainer>
      <Text className="subtitle">{t("SessionsSubtitle")}</Text>

      <SessionsTable t={t} sessionsData={allSessions} />

      <DownLoadWrapper>
        <Button
          className="download-report_button"
          primary
          label={t("DownloadReportBtnText")}
          size="normal"
          minwidth="auto"
          onClick={() => console.log("get report")}
          isLoading={false}
        />
        <span className="download-report_description">
          {t("DownloadReportDescription")}
        </span>
      </DownLoadWrapper>

      {disableDialogVisible && (
        <DisableUserDialog
          t={t}
          visible={disableDialogVisible}
          onClose={() => setDisableDialogVisible(false)}
          fetchData={fetchData}
          userIds={userIds}
          updateUserStatus={updateUserStatus}
        />
      )}

      {logoutDialogVisible && (
        <LogoutSessionDialog
          t={t}
          visible={logoutDialogVisible}
          data={platformData}
          isLoading={isLoading}
          onClose={() => setLogoutDialogVisible(false)}
          onRemoveSession={onClickRemoveSession}
        />
      )}

      {logoutAllDialogVisible && (
        <LogoutAllSessionDialog
          t={t}
          visible={logoutAllDialogVisible}
          isLoading={isLoading}
          exceptId={exceptId}
          displayName={displayName}
          onClose={() => setLogoutAllDialogVisible(false)}
          onLogoutAllSessions={onClickLogoutAllSessions}
          onLogoutAllExceptThis={onClickLogoutAllExceptThis}
        />
      )}
    </MainContainer>
  );
};

export default inject(({ settingsStore, setup, peopleStore }) => {
  const { updateUserStatus } = peopleStore.usersStore;
  const { socketHelper, currentDeviceType } = settingsStore;
  const {
    allSessions,
    sessionsData,
    dataFromSocket,
    displayName,
    clearSelection,
    setDataFromSocket,
    updateAllSessions,
    platformData,
    fetchData,
    selection,
    bufferSelection,
    isLoading,
    onClickLogoutAllSessions,
    onClickLogoutAllExceptThis,
    onClickRemoveSession,
  } = peopleStore.selectionStore;

  const {
    viewAs,
    setViewAs,
    disableDialogVisible,
    logoutDialogVisible,
    logoutAllDialogVisible,
    setDisableDialogVisible,
    setLogoutDialogVisible,
    setLogoutAllDialogVisible,
  } = setup;

  return {
    allSessions,
    sessionsData,
    dataFromSocket,
    displayName,
    clearSelection,
    setDataFromSocket,
    updateAllSessions,
    platformData,
    selection,
    bufferSelection,
    fetchData,
    viewAs,
    setViewAs,
    socketHelper,
    currentDeviceType,
    disableDialogVisible,
    logoutDialogVisible,
    logoutAllDialogVisible,
    setDisableDialogVisible,
    setLogoutDialogVisible,
    setLogoutAllDialogVisible,
    isLoading,
    onClickLogoutAllSessions,
    onClickLogoutAllExceptThis,
    onClickRemoveSession,
    updateUserStatus,
    isSessionsLoaded: allSessions.length > 0,
  };
})(
  withTranslation(["Settings", "Profile", "Common", "ChangeUserStatusDialog"])(
    observer(Sessions),
  ),
);
