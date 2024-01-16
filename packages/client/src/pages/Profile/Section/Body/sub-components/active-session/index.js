import RemoveSessionSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
import TickSvgUrl from "PUBLIC_DIR/images/tick.svg?url";
import InfoReactSvgUrl from "PUBLIC_DIR/images/info.react.svg?url";
import React, { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { Box } from "@docspace/shared/components/box";
import { HelpButton } from "@docspace/shared/components/help-button";
import { toastr } from "@docspace/shared/components/toast";
import { useTheme } from "styled-components";
import { convertTime } from "@docspace/shared/utils/convertTime";
import Loaders from "@docspace/common/components/Loaders";

import {
  LogoutSessionDialog,
  LogoutAllSessionDialog,
} from "SRC_DIR/components/dialogs";

import {
  StyledFooter,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableDataCell,
} from "./styled-active-sessions";
import { DeviceType } from "@docspace/shared/enums";
import moment from "moment-timezone";

const removeIcon = (
  <ReactSVG className="remove-icon" src={RemoveSessionSvgUrl} />
);
const tickIcon = (
  <ReactSVG className="tick-icon" wrapper="span" src={TickSvgUrl} />
);

const ActiveSessions = ({
  t,
  locale,
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
  currentSession,
  setSessions,
  currentDeviceType,
}) => {
  const isDesktop = currentDeviceType === DeviceType.desktop;
  const isMobile = currentDeviceType === DeviceType.mobile;

  const [modalData, setModalData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { interfaceDirection } = useTheme();

  useEffect(() => {
    getSessions();
  }, []);

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
        getAllSessions().then((res) => setSessions(res.items))
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
        getAllSessions().then((res) => setSessions(res.items))
      );
      toastr.success(
        t("Profile:SuccessLogout", {
          platform: foundSession.platform,
          browser: foundSession.browser,
        })
      );
    } catch (error) {
      toastr.error(error);
    } finally {
      setIsLoading(false);
      setLogoutDialogVisible(false);
    }
  };

  const tableCell = (platform, browser) =>
    interfaceDirection === "rtl" && !isMobile ? (
      <>
        <span className="session-browser">
          <span>{browser}</span>
        </span>
        {platform}
      </>
    ) : (
      <>
        {platform}
        <span className="session-browser">
          <span>{browser}</span>
        </span>
      </>
    );
  if (!sessionsIsInit) return <Loaders.ProfileFooter isProfileFooter />;
  return (
    <StyledFooter>
      <Text fontSize="16px" fontWeight={700} lineHeight="22px">
        {t("Profile:ActiveSessions")}
      </Text>
      <Box
        displayProp="flex"
        alignItems="center"
        justifyContent="flex-start"
        marginProp="10px 0 0"
      >
        <Link
          className="session-logout"
          type="action"
          isHovered
          onClick={() => setLogoutAllDialogVisible(true)}
        >
          {t("Profile:LogoutAllActiveSessions")}
        </Link>
        <HelpButton
          offsetRight={0}
          iconName={InfoReactSvgUrl}
          tooltipContent={
            <Text fontSize="12px">
              {t("Profile:LogoutAllActiveSessionsDescription")}
            </Text>
          }
        />
      </Box>
      {!isDesktop ? (
        <Table>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableDataCell style={{ borderTop: "0" }}>
                  {tableCell(session.platform, session.browser)}
                  {currentSession === session.id ? tickIcon : null}

                  <Box flexDirection="column" alignItems="center">
                    <span className="session-date">
                      {convertTime(session.date)}
                    </span>
                    <span className="session-ip" dir="ltr">
                      {session.ip}
                    </span>
                  </Box>
                </TableDataCell>

                <TableDataCell
                  style={{ borderTop: "0" }}
                  onClick={() => {
                    setLogoutDialogVisible(true);
                    setModalData({
                      id: session.id,
                      platform: session.platform,
                      browser: session.browser,
                    });
                  }}
                >
                  {currentSession !== session.id ? removeIcon : null}
                </TableDataCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>{t("Common:Sessions")}</TableHeaderCell>
              <TableHeaderCell>{t("Common:Date")}</TableHeaderCell>
              <TableHeaderCell>{t("Common:IpAddress")}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableDataCell>
                  {tableCell(session.platform, session.browser)}
                  {currentSession === session.id ? tickIcon : null}
                </TableDataCell>
                <TableDataCell>{convertTime(session.date)}</TableDataCell>
                <TableDataCell>{session.ip}</TableDataCell>
                <TableDataCell
                  onClick={() => {
                    setLogoutDialogVisible(true);
                    setModalData({
                      id: session.id,
                      platform: session.platform,
                      browser: session.browser,
                    });
                  }}
                >
                  {currentSession !== session.id ? removeIcon : null}
                </TableDataCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {logoutDialogVisible && (
        <LogoutSessionDialog
          t={t}
          visible={logoutDialogVisible}
          data={modalData}
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
          onClose={() => setLogoutAllDialogVisible(false)}
          onRemoveAllSessions={onClickRemoveAllSessions}
          onRemoveAllExceptThis={onClickRemoveAllExceptThis}
        />
      )}
    </StyledFooter>
  );
};

export default inject(({ auth, setup }) => {
  const { culture, currentDeviceType } = auth.settingsStore;
  const { user } = auth.userStore;
  const locale = (user && user.cultureName) || culture || "en";

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
    currentSession,
    getSessions,
    setSessions,
  } = setup;
  return {
    locale,
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
    currentSession,
    getSessions,
    setSessions,
    currentDeviceType,
  };
})(observer(withTranslation(["Profile", "Common"])(ActiveSessions)));
