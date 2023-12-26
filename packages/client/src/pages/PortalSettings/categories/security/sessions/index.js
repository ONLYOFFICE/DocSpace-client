import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { MainContainer } from "../StyledSecurity";
import Text from "@docspace/components/text";

const Sessions = ({ t }) => {
  return (
    <MainContainer>
      <Text className="subtitle">{t("SessionsSubtitle")}</Text>
    </MainContainer>
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
    logoutVisible,
    setLogoutVisible,
    logoutAllVisible,
    setLogoutAllVisible,
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
    logoutVisible,
    setLogoutVisible,
    logoutAllVisible,
    setLogoutAllVisible,
    removeAllExecptThis,
    sessionsIsInit,
    sessions,
    currentSession,
    getSessions,
    setSessions,
    currentDeviceType,
  };
})(withTranslation(["Settings", "Common"])(observer(Sessions)));
