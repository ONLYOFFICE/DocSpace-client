import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { Trans, withTranslation } from "react-i18next";
import { getStepTitle, getGoogleStepDescription } from "../../../utils";
import { tablet, isMobile } from "@docspace/shared/utils/device";
import useViewEffect from "SRC_DIR/Hooks/useViewEffect";
import styled, { css } from "styled-components";
import { useNavigate } from "react-router-dom";

import StepContent from "./Stepper";
import BreakpointWarning from "SRC_DIR/components/BreakpointWarning";
import { Text } from "@docspace/shared/components/text";
import { Box } from "@docspace/shared/components/box";
import { HelpButton } from "@docspace/shared/components/help-button";
import { toastr } from "@docspace/shared/components/toast";

const STEP_LENGTH = 6;

const GoogleWrapper = styled.div`
  margin-top: 1px;

  .workspace-subtitle {
    color: ${(props) => props.theme.client.settings.migration.descriptionColor};
    max-width: 700px;
    line-height: 20px;
    margin-bottom: 20px;

    @media ${tablet} {
      max-width: 675px;
      margin-bottom: 28px;
    }
  }

  .step-counter {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 5px;
          `
        : css`
            margin-right: 5px;
          `}

    font-size: 16px;
    font-weight: 700;
    color: ${(props) => props.theme.client.settings.migration.subtitleColor};
  }

  .step-title {
    font-size: 16px;
    font-weight: 700;
    color: ${(props) => props.theme.client.settings.migration.subtitleColor};
  }

  .step-description {
    max-width: 700px;
    font-size: 12px;
    margin-bottom: 16px;
    line-height: 16px;
    color: ${(props) =>
      props.theme.client.settings.migration.stepDescriptionColor};

    @media ${tablet} {
      max-width: 675px;
    }
  }
`;

const GoogleWorkspace = ({
  t,
  clearCheckedAccounts,
  viewAs,
  setViewAs,
  currentDeviceType,
  getMigrationStatus,
  setUsers,
}) => {
  const [showReminder, setShowReminder] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [shouldRender, setShouldRender] = useState(false);
  const navigate = useNavigate();

  const onNextStep = () => {
    if (currentStep !== 6) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const onPrevStep = () => {
    if (currentStep !== 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const helpContent = () => (
    <Text fontSize="12px">
      <Trans
        i18nKey="TypesAndPrivileges"
        ns="Settings"
        t={t}
        components={{
          1: <strong></strong>,
          2: <strong></strong>,
          3: <strong></strong>,
          4: <strong></strong>,
        }}
      />
    </Text>
  );

  const tooltipStyle = {
    display: "inline-block",
    position: "relative",
    bottom: "-2px",
    margin: "0px 5px",
  };

  const renderTooltip = (
    <HelpButton
      place="bottom"
      offsetRight={0}
      getContent={helpContent}
      style={tooltipStyle}
    />
  );

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  useEffect(() => {
    try {
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

        if (res.parseResult.migratorName !== "GoogleWorkspace") {
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

        if (res.parseResult.operation === "migration" && !res.isCompleted) {
          setCurrentStep(5);
        }

        // if (res.parseResult.operation === "migration" && res.isCompleted) {
        //   setCurrentStep(6);
        // }

        if (res.parseResult.operation === "parse" && res.isCompleted) {
          setUsers(res.parseResult);
          setCurrentStep(2);
        }
        setShouldRender(true);
      });
    } catch (error) {
      toastr.error(error);
    }

    return clearCheckedAccounts;
  }, []);

  if (isMobile())
    return <BreakpointWarning sectionName={t("Settings:DataImport")} />;

  if (!shouldRender) return;

  return (
    <GoogleWrapper>
      <Text className="workspace-subtitle">
        {t("Settings:AboutDataImport")}
      </Text>
      <div className="step-container">
        <Box displayProp="flex" marginProp="0 0 8px">
          <Text className="step-counter">
            {currentStep}/{STEP_LENGTH}.
          </Text>
          <Text className="step-title">{getStepTitle(t, currentStep)}</Text>
        </Box>
        <Box className="step-description">
          {getGoogleStepDescription(t, currentStep, renderTooltip, Trans)}
        </Box>
        <StepContent
          t={t}
          currentStep={currentStep}
          onNextStep={onNextStep}
          onPrevStep={onPrevStep}
          showReminder={showReminder}
          setShowReminder={setShowReminder}
        />
      </div>
    </GoogleWrapper>
  );
};

export default inject(({ setup, settingsStore, importAccountsStore }) => {
  const { clearCheckedAccounts, getMigrationStatus, setUsers } =
    importAccountsStore;
  const { viewAs, setViewAs } = setup;
  const { currentDeviceType } = settingsStore;

  return {
    clearCheckedAccounts,
    viewAs,
    setViewAs,
    currentDeviceType,
    getMigrationStatus,
    setUsers,
  };
})(withTranslation(["Common, Settings"])(observer(GoogleWorkspace)));
