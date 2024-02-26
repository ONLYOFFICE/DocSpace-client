import SelectFileStep from "./SelectFileStep";
import SelectUsersStep from "./SelectUsersStep";
import AddEmailsStep from "./AddEmailsStep";
import SelectUsersTypeStep from "./SelectUsersTypeStep";
import ImportStep from "./ImportStep";
import ImportProcessingStep from "./ImportProcessingStep";
import ImportCompleteStep from "./ImportCompleteStep";

import { HelpButton } from "@docspace/shared/components/help-button";
import { Text } from "@docspace/shared/components/text";

import { Trans } from "react-i18next";

export const getStepsData = (t, currentStep, setCurrentStep) => {
  const isSixthStep = currentStep === 6;

  const incrementStep = () => {
    if (currentStep !== 7) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const decrementStep = () => {
    if (currentStep !== 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return [
    {
      title: t("Common:SelectFile"),
      description: t("Settings:SelectFileDescriptionNextcloud"),
      component: (
        <SelectFileStep
          t={t}
          incrementStep={incrementStep}
          decrementStep={decrementStep}
          setStep={setCurrentStep}
        />
      ),
    },
    {
      title: t("Settings:SelectUsersWithEmail"),
      description: t("Settings:SelectUsersDescriptionNextcloud"),
      component: (
        <SelectUsersStep
          t={t}
          incrementStep={incrementStep}
          decrementStep={decrementStep}
        />
      ),
    },
    {
      title: t("Settings:AddEmails"),
      description: t("Settings:AddEmailsDescription"),
      component: (
        <AddEmailsStep
          t={t}
          incrementStep={incrementStep}
          decrementStep={decrementStep}
        />
      ),
    },
    {
      title: t("Settings:SelectUserTypes"),
      description: (
        <>
          <Trans t={t} ns="Settings" i18nKey="SelectUserTypesDescription">
            Select DocSpace roles for the imported users: <b>DocSpace admin</b>,{" "}
            <b>Room admin</b>
            or <b>Power user</b>. By default, Power user role is selected for
            each user. You can manage the roles after the import.
          </Trans>
          <HelpButton
            place="bottom"
            offsetRight={0}
            tooltipContent={
              <Text>
                <Trans
                  i18nKey="TypesAndPrivileges"
                  ns="Settings"
                  t={t}
                  components={{
                    1: <b></b>,
                    2: <b></b>,
                    3: <b></b>,
                    4: <b></b>,
                  }}
                />
              </Text>
            }
            style={{
              display: "inline-block",
              position: "relative",
              bottom: "-2px",
              margin: "0px 5px",
            }}
          />
        </>
      ),
      component: (
        <SelectUsersTypeStep
          t={t}
          incrementStep={incrementStep}
          decrementStep={decrementStep}
        />
      ),
    },
    {
      title: t("Settings:DataImport"),
      description: t("Settings:ImportSectionDescription"),
      component: (
        <ImportStep
          t={t}
          incrementStep={incrementStep}
          decrementStep={decrementStep}
        />
      ),
    },
    {
      title: t("Settings:DataImportProcessing"),
      description: t("Settings:ImportProcessingDescription"),
      component: (
        <ImportProcessingStep
          t={t}
          incrementStep={incrementStep}
          decrementStep={decrementStep}
          isSixthStep={isSixthStep}
        />
      ),
    },
    {
      title: t("Settings:DataImportComplete"),
      description: t("Settings:ImportCompleteDescriptionNextcloud"),
      component: (
        <ImportCompleteStep
          t={t}
          incrementStep={incrementStep}
          decrementStep={decrementStep}
        />
      ),
    },
  ];
};
