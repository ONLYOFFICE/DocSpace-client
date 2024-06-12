import { useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { mobile, tablet } from "@docspace/shared/utils";
import { toastr } from "@docspace/shared/components/toast";
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
  connections,
  setConnections,
  updateAllSessions,
  platformData,
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
  removeSession,
  removeAllActiveSessionsById,
  removeAllExceptThisEventId,
}) => {
  const [isLoading, setIsLoading] = useState(false);

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

  const onClickLogoutAllSessions = async () => {
    try {
      setIsLoading(true);
      await removeAllActiveSessionsById(connections[0]?.userId);
      setConnections([]);
      await fetchData();
      toastr.success("Successfully logout all sessions");
    } catch (error) {
      toastr.error("The user is already logged out");
    } finally {
      setIsLoading(false);
      setLogoutAllDialogVisible(false);
    }
  };

  const onClickLogoutAllExceptThis = async (id) => {
    try {
      setIsLoading(true);
      await removeAllExceptThisEventId(connections[0]?.id);

      const filteredConnections = connections.filter(
        (connection) => connection.id === id,
      );
      setConnections(filteredConnections);
      await fetchData();
      toastr.success("Successfully logout except this");
    } catch (error) {
      toastr.error("The user is already logged out");
    } finally {
      setIsLoading(false);
      setLogoutAllDialogVisible(false);
    }
  };

  const onClickRemoveSession = async (id) => {
    const foundConnection = connections.find(
      (connection) => connection.id === id,
    );

    if (!foundConnection) return;

    try {
      setIsLoading(true);
      await removeSession(foundConnection.id);
      const filteredConnections = connections.filter(
        (connection) => connection.id !== id,
      );
      setConnections(filteredConnections);
      await fetchData();
      toastr.success(
        t("Profile:SuccessLogout", {
          platform: foundConnection.platform,
          browser: foundConnection.browser,
        }),
      );
    } catch (error) {
      toastr.error(error);
    } finally {
      setIsLoading(false);
      setLogoutDialogVisible(false);
    }
  };

  // console.log("allSessions", JSON.parse(JSON.stringify(allSessions)));
  // console.log("sessionsData", JSON.parse(JSON.stringify(sessionsData)));
  // console.log("connections", JSON.parse(JSON.stringify(connections)));
  // console.log("userLastSession", JSON.parse(JSON.stringify(userLastSession)));

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
          connections={connections}
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
  const { socketHelper, currentDeviceType } = settingsStore;
  const {
    allSessions,
    sessionsData,
    dataFromSocket,
    displayName,
    clearSelection,
    setDataFromSocket,
    connections,
    setConnections,
    updateAllSessions,
    platformData,
    fetchData,
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
    removeSession,
    removeAllActiveSessionsById,
    removeAllExceptThisEventId,
  } = setup;

  return {
    allSessions,
    sessionsData,
    dataFromSocket,
    displayName,
    clearSelection,
    setDataFromSocket,
    connections,
    setConnections,
    updateAllSessions,
    platformData,
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
    removeSession,
    removeAllActiveSessionsById,
    removeAllExceptThisEventId,
  };
})(
  withTranslation(["Settings", "Profile", "Common", "ChangeUserStatusDialog"])(
    observer(Sessions),
  ),
);
