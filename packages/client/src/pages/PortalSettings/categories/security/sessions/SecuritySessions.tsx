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

import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { mobile, tablet } from "@docspace/shared/utils";
import SessionsLoader from "@docspace/shared/skeletons/sessions";
import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { TTranslation } from "@docspace/shared/types";
import SocketHelper from "@docspace/shared/utils/socket";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";
import { DisableUserDialog } from "SRC_DIR/components/dialogs/DisableUserDialog";
import { LogoutSessionDialog } from "SRC_DIR/components/dialogs/LogoutSessionDialog";
import { LogoutAllSessionDialog } from "SRC_DIR/components/dialogs/LogoutAllSessionDialog";

import { SessionsProps } from "./SecuritySessions.types";
import { MainContainer } from "../StyledSecurity";
import SessionsTable from "./SessionsTable";

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
  allSessions,
  displayName,
  clearSelection,
  platformData,
  selection,
  bufferSelection,
  fetchData,
  isLoading,
  viewAs,
  setViewAs,
  currentDeviceType,
  disableDialogVisible,
  logoutDialogVisible,
  logoutAllDialogVisible,
  setDisableDialogVisible,
  setLogoutDialogVisible,
  setLogoutAllDialogVisible,
  onClickLogoutAllUsers,
  onClickLogoutAllSessions,
  onClickLogoutAllExceptThis,
  onClickRemoveSession,
  updateUserStatus,
  getLoginHistoryReport,
  isLoadingDownloadReport,
  setUserSessionPanelVisible,
  isSeveralSelection,
  isSessionsLoaded,
  usersWithLastSession,
  fetchUsersWithLastSession,
}: SessionsProps) => {
  const { t }: { t: TTranslation } = useTranslation([
    "Settings",
    "Profile",
    "Common",
    "ChangeUserStatusDialog",
  ]);

  useEffect(() => {
    // SocketHelper.emit("getSessionsInPortal");
    fetchUsersWithLastSession();

    fetchData();
    return () => {
      clearSelection();
    };
  }, [fetchUsersWithLastSession, fetchData, clearSelection]);

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  const selectionUserId = selection.map((user) => user.id);

  const userIds =
    bufferSelection?.id !== undefined
      ? [bufferSelection.id, ...selectionUserId]
      : [...selectionUserId];

  if (!usersWithLastSession.length) return <SessionsLoader viewAs={viewAs} />;

  return (
    <MainContainer>
      <Text className="subtitle">{t("SessionsSubtitle")}</Text>

      <SessionsTable
        t={t}
        sessionsData={usersWithLastSession}
        sectionWidth={0}
      />

      <DownLoadWrapper>
        <Button
          className="download-report_button"
          primary
          label={t("DownloadReportBtnText")}
          size={ButtonSize.normal}
          onClick={() => getLoginHistoryReport()}
          isLoading={isLoadingDownloadReport}
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
          onClosePanel={() => setUserSessionPanelVisible(false)}
          fetchData={fetchData}
          isLoading={isLoading}
          userIds={userIds}
          updateUserStatus={updateUserStatus}
          clearSelection={clearSelection}
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
          userIds={userIds}
          displayName={displayName}
          selection={selection}
          bufferSelection={bufferSelection}
          isSeveralSelection={isSeveralSelection}
          onClose={() => setLogoutAllDialogVisible(false)}
          onClosePanel={() => setUserSessionPanelVisible(false)}
          onLogoutAllUsers={onClickLogoutAllUsers}
          onLogoutAllSessions={onClickLogoutAllSessions}
          onLogoutAllExceptThis={onClickLogoutAllExceptThis}
        />
      )}
    </MainContainer>
  );
};

export const SecuritySessions = inject<TStore>(
  ({
    settingsStore,
    setup,
    peopleStore,
    dialogsStore,
    activeSessionsStore,
  }) => {
    const { updateUserStatus } = peopleStore.usersStore;
    const { currentDeviceType } = settingsStore;
    const { setUserSessionPanelVisible } = dialogsStore;
    const {
      allSessions,
      displayName,
      clearSelection,
      platformData,
      fetchData,
      selection,
      bufferSelection,
      isLoading,
      isSeveralSelection,
      onClickLogoutAllUsers,
      onClickLogoutAllSessions,
      onClickLogoutAllExceptThis,
      onClickRemoveSession,
      isSessionsLoaded,
      usersWithLastSession,
      fetchUsersWithLastSession,
    } = activeSessionsStore;

    const {
      viewAs,
      setViewAs,
      disableDialogVisible,
      logoutDialogVisible,
      logoutAllDialogVisible,
      setDisableDialogVisible,
      setLogoutDialogVisible,
      setLogoutAllDialogVisible,
      getLoginHistoryReport,
      isLoadingDownloadReport,
    } = setup;

    return {
      allSessions,
      displayName,
      clearSelection,
      platformData,
      selection,
      bufferSelection,
      fetchData,
      viewAs,
      setViewAs,
      currentDeviceType,
      disableDialogVisible,
      logoutDialogVisible,
      logoutAllDialogVisible,
      setDisableDialogVisible,
      setLogoutDialogVisible,
      setLogoutAllDialogVisible,
      isLoading,
      onClickLogoutAllUsers,
      onClickLogoutAllSessions,
      onClickLogoutAllExceptThis,
      onClickRemoveSession,
      updateUserStatus,
      getLoginHistoryReport,
      isLoadingDownloadReport,
      setUserSessionPanelVisible,
      isSeveralSelection,
      isSessionsLoaded,
      usersWithLastSession,
      fetchUsersWithLastSession,
    };
  },
)(observer(Sessions));
