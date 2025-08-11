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

import InfoReactSvgUrl from "PUBLIC_DIR/images/info.react.svg?url";

import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import styled from "styled-components";
import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { toastr } from "@docspace/shared/components/toast";
import { HelpButton } from "@docspace/shared/components/help-button";
import { ProfileFooterLoader } from "@docspace/shared/skeletons/profile";

import {
  LogoutSessionDialog,
  LogoutAllSessionDialog,
} from "SRC_DIR/components/dialogs";
import SessionsTable from "./SessionsTable";

const StyledWrapper = styled.div`
  .auto-delete-title {
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    margin-top: 8px;
    color: ${(props) => props.theme.profile.activeSessions.tableCellColor};
  }
  .terminate-session-container {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin: 10px 0 0;
  }
  .terminate-all-sessions {
    font-size: 13px;
    font-weight: 600;
    margin-inline-end: 5px;
  }
`;

const ActiveSessions = ({
  t,
  getAllSessions,
  removeAllSessions,
  removeSession,
  logoutDialogVisible,
  setLogoutDialogVisible,
  logoutAllDialogVisible,
  setLogoutAllDialogVisible,
  removeAllExecptThis,
  sessionsIsInit,
  getSessions,
  sessions,
  viewAs,
  setViewAs,
  currentDeviceType,
  setSessions,
  platformModalData,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getSessions();
  }, []);

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  const onClickRemoveAllSessions = async () => {
    try {
      setIsLoading(true);
      await removeAllSessions().then((res) => window.location.replace(res));
    } catch (error) {
      toastr.error(error);
    } finally {
      setIsLoading(false);
      setLogoutAllDialogVisible(false);
    }
  };

  const onClickRemoveAllExceptThis = async () => {
    try {
      setIsLoading(true);
      await removeAllExecptThis().then(() =>
        getAllSessions().then((res) => setSessions(res.items)),
      );
    } catch (error) {
      toastr.error(error);
    } finally {
      setIsLoading(false);
      setLogoutAllDialogVisible(false);
    }
  };

  const onClickRemoveSession = async (id) => {
    const foundSession = sessions.find((s) => s.id === id);
    try {
      setIsLoading(true);
      await removeSession(foundSession.id).then(() =>
        getAllSessions().then((res) => setSessions(res.items)),
      );
      toastr.success(
        t("Profile:SuccessLogout", {
          platform: foundSession.platform,
          browser: foundSession.browser,
        }),
      );
    } catch (error) {
      toastr.error(error);
    } finally {
      setIsLoading(false);
      setLogoutDialogVisible(false);
    }
  };

  const tooltipContent = (
    <Text fontSize="12px">
      {t("Profile:LogoutAllActiveSessionsDescription")}
    </Text>
  );

  if (!sessionsIsInit) return <ProfileFooterLoader isProfileFooter />;

  return (
    <StyledWrapper>
      <Text fontSize="16px" fontWeight={700} lineHeight="22px">
        {t("Profile:ActiveSessions")}
      </Text>

      {/* TODO: Uncomment after fix on backend */}
      {/* <Text className="auto-delete-title">{t("Profile:AutoDeleteTitle")}</Text> */}

      <div className="terminate-session-container">
        <Link
          className="terminate-all-sessions"
          type="action"
          isHovered
          onClick={() => setLogoutAllDialogVisible(true)}
          dataTestId="terminate_all_sessions_link"
        >
          {t("Profile:TerminateAllSessions")}
        </Link>
        <HelpButton
          offsetRight={0}
          iconName={InfoReactSvgUrl}
          tooltipContent={tooltipContent}
          dataTestId="terminate_all_sessions_help_button"
        />
      </div>

      <SessionsTable t={t} sessionsData={sessions} viewAs={viewAs} />

      {logoutDialogVisible ? (
        <LogoutSessionDialog
          t={t}
          visible={logoutDialogVisible}
          data={platformModalData}
          isLoading={isLoading}
          onClose={() => setLogoutDialogVisible(false)}
          onRemoveSession={onClickRemoveSession}
        />
      ) : null}

      {logoutAllDialogVisible ? (
        <LogoutAllSessionDialog
          t={t}
          visible={logoutAllDialogVisible}
          isLoading={isLoading}
          onClose={() => setLogoutAllDialogVisible(false)}
          onRemoveAllSessions={onClickRemoveAllSessions}
          onRemoveAllExceptThis={onClickRemoveAllExceptThis}
        />
      ) : null}
    </StyledWrapper>
  );
};

export default inject(({ settingsStore, setup }) => {
  const { currentDeviceType } = settingsStore;

  const {
    getAllSessions,
    removeAllSessions,
    removeSession,
    logoutDialogVisible,
    setLogoutDialogVisible,
    logoutAllDialogVisible,
    setLogoutAllDialogVisible,
    removeAllExecptThis,
    sessionsIsInit,
    sessions,
    viewAs,
    setViewAs,
    getSessions,
    setSessions,
    platformModalData,
  } = setup;
  return {
    getAllSessions,
    removeAllSessions,
    removeSession,
    logoutDialogVisible,
    setLogoutDialogVisible,
    logoutAllDialogVisible,
    setLogoutAllDialogVisible,
    removeAllExecptThis,
    sessionsIsInit,
    sessions,
    viewAs,
    setViewAs,
    getSessions,
    setSessions,
    currentDeviceType,
    platformModalData,
  };
})(observer(withTranslation(["Profile", "Common"])(ActiveSessions)));
