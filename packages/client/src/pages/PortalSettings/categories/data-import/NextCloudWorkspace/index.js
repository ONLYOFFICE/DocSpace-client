import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { isMobile } from "@docspace/shared/utils/device";
import useViewEffect from "SRC_DIR/Hooks/useViewEffect";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import { Text } from "@docspace/shared/components/text";
import BreakpointWarning from "SRC_DIR/components/BreakpointWarning";
import { getStepsData } from "./Stepper";

const NextcloudWrapper = styled.div`
  max-width: 700px;

  .data-import-counter {
    margin-top: 19px;
    margin-bottom: 9px;
  }

  .data-import-section-description {
    margin-bottom: 8px;
    font-size: 12px;
  }
`;

const NextcloudWorkspace = (props) => {
  const {
    t,
    tReady,
    theme,
    clearCheckedAccounts,
    viewAs,
    setViewAs,
    currentDeviceType,
    getMigrationStatus,
    setUsers,
  } = props;
  const [currentStep, setCurrentStep] = useState(1);
  const [shouldRender, setShouldRender] = useState(false);
  const StepsData = getStepsData(t, currentStep, setCurrentStep);
  const navigate = useNavigate();

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  useEffect(() => {
    getMigrationStatus().then((res) => {
      if (
        !res ||
        res.parseResult.users.length +
          res.parseResult.existUsers.length +
          res.parseResult.withoutEmailUsers.length ===
          0
      ) {
        setShouldRender(true);
        return;
      }

      if (res.parseResult.migratorName !== "Nextcloud") {
        const workspacesEnum = {
          GoogleWorkspace: "google",
          Nextcloud: "nextcloud",
          Workspace: "onlyoffice",
        };
        const migratorName = res.parseResult.migratorName;

        setShouldRender(true);
        navigate(
          `/portal-settings/data-import/migration/${workspacesEnum[migratorName]}?service=${migratorName}`,
        );
      }

      if (res.parseResult.operation === "parse" && res.isCompleted) {
        setUsers(res.parseResult);
        setCurrentStep(2);
      }

      if (res.parseResult.operation === "migration" && !res.isCompleted) {
        setCurrentStep(6);
      }

      if (res.parseResult.operation === "migration" && res.isCompleted) {
        setCurrentStep(7);
      }

      setShouldRender(true);
    });

    return clearCheckedAccounts;
  }, []);

  if (isMobile())
    return <BreakpointWarning sectionName={t("Settings:DataImport")} />;

  if (!tReady || !shouldRender) return;

  return (
    <>
      <NextcloudWrapper>
        <Text
          className="data-import-description"
          lineHeight="20px"
          color={theme.isBase ? "#657077" : "#ADADAD"}
        >
          {t("Settings:AboutDataImport")}
        </Text>
        <Text
          className="data-import-counter"
          fontSize="16px"
          fontWeight={700}
          lineHeight="22px"
        >
          {currentStep}/{StepsData.length}. {StepsData[currentStep - 1].title}
        </Text>
        <div className="data-import-section-description">
          {StepsData[currentStep - 1].description}
        </div>
      </NextcloudWrapper>
      {StepsData[currentStep - 1].component}
    </>
  );
};

export default inject(({ setup, settingsStore, importAccountsStore }) => {
  const { clearCheckedAccounts, getMigrationStatus, setUsers } =
    importAccountsStore;
  const { initSettings, viewAs, setViewAs } = setup;
  const { currentDeviceType } = settingsStore;

  return {
    initSettings,
    theme: settingsStore.theme,
    clearCheckedAccounts,
    viewAs,
    setViewAs,
    currentDeviceType,
    getMigrationStatus,
    setUsers,
  };
})(
  withTranslation(["Common, SMTPSettings, Settings"])(
    observer(NextcloudWorkspace),
  ),
);
