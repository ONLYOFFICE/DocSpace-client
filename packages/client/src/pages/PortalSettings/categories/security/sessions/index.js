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
import mockData from "./mockData";

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
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    line-height: ${(props) => props.theme.getCorrectFontSize("20px")};
    padding-top: 5px;
    padding-bottom: 5px;

    @media ${tablet} {
      font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
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
    font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
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
  viewAs,
  setViewAs,
  currentDeviceType,
  allSessions,
  setAllSessions,
  clearSelection,
  disableDialogVisible,
  logoutDialogVisible,
  logoutAllDialogVisible,
  setDisableDialogVisible,
  setLogoutDialogVisible,
  setLogoutAllDialogVisible,
  sessionModalData,
  platformModalData,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAllSessions(mockData);
    return () => {
      clearSelection();
    };
  }, []);

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  const onClickRemoveAllSessions = () => {
    try {
      setIsLoading(true);
      console.log("onClickRemoveAllSessions");
    } catch (error) {
      toastr.error(error);
    } finally {
      setIsLoading(false);
      setLogoutAllDialogVisible(false);
    }
  };

  const onClickRemoveAllExceptThis = () => {
    try {
      setIsLoading(true);
      console.log("onClickRemoveAllExceptThis");
    } catch (error) {
      toastr.error(error);
    } finally {
      setIsLoading(false);
      setLogoutAllDialogVisible(false);
    }
  };

  const onClickRemoveSession = () => {
    try {
      setIsLoading(true);
      console.log("onClickRemoveSession");
    } catch (error) {
      toastr.error(error);
    } finally {
      setIsLoading(false);
      setLogoutDialogVisible(false);
    }
  };

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
          data={platformModalData}
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
          data={sessionModalData}
          onClose={() => setLogoutAllDialogVisible(false)}
          onRemoveAllSessions={onClickRemoveAllSessions}
          onRemoveAllExceptThis={onClickRemoveAllExceptThis}
        />
      )}
    </MainContainer>
  );
};

export default inject(({ auth, setup, peopleStore }) => {
  const { culture, currentDeviceType } = auth.settingsStore;
  const { user } = auth.userStore;
  const locale = (user && user.cultureName) || culture || "en";
  const { clearSelection, allSessions, setAllSessions } =
    peopleStore.selectionStore;

  const {
    viewAs,
    setViewAs,
    disableDialogVisible,
    logoutDialogVisible,
    logoutAllDialogVisible,
    setDisableDialogVisible,
    setLogoutDialogVisible,
    setLogoutAllDialogVisible,
    sessionModalData,
    platformModalData,
  } = setup;

  return {
    locale,
    currentDeviceType,
    viewAs,
    setViewAs,
    allSessions,
    setAllSessions,
    clearSelection,
    disableDialogVisible,
    logoutDialogVisible,
    logoutAllDialogVisible,
    setDisableDialogVisible,
    setLogoutDialogVisible,
    setLogoutAllDialogVisible,
    sessionModalData,
    platformModalData,
  };
})(
  withTranslation(["Settings", "Profile", "Common", "ChangeUserStatusDialog"])(
    observer(Sessions)
  )
);
