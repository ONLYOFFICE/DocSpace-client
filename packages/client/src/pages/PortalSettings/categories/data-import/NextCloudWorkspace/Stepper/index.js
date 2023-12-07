import FirstStep from "./FirstStep";
import SecondStep from "./SecondStep";
import ThirdStep from "./ThirdStep";
import FourthStep from "./FourthStep";
import FifthStep from "./FifthStep";
import SixthStep from "./SixthStep";
import SeventhStep from "./SeventhStep";

import HelpButton from "@docspace/components/help-button";
import Text from "@docspace/components/text";

import { Trans } from "react-i18next";

export const getStepsData = (t, currentStep, setCurrentStep) => {
  const isSixthStep = currentStep === 6;

  const incrementStep = () => {
    if (currentStep !== 6) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const decrementStep = () => {
    if (currentStep !== 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return [
    {
      title: t("Common:SelectFile"),
      description: t("Settings:SelectFileDescriptionNextcloud"),
      component: <FirstStep t={t} incrementStep={incrementStep} decrementStep={decrementStep} />,
    },
    {
      title: t("Settings:SelectUsersWithEmail"),
      description: t("Settings:SelectUsersDescriptionNextcloud"),
      component: <SecondStep t={t} incrementStep={incrementStep} decrementStep={decrementStep} />,
    },
    {
      title: t("Settings:AddEmails"),
      description: t("Settings:AddEmailsDescription"),
      component: <ThirdStep t={t} incrementStep={incrementStep} decrementStep={decrementStep} />,
    },
    {
      title: t("Settings:SelectUserTypes"),
      description: (
        <>
          <Trans t={t} ns="Settings" i18nKey="SelectUserTypesDescription">
            Select DocSpace roles for the imported users: <b>DocSpace admin</b>, <b>Room admin</b>
            or <b>Power user</b>. By default, Power user role is selected for each user. You can
            manage the roles after the import.
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
              marginLeft: "4px",
            }}
          />
        </>
      ),
      component: <FourthStep t={t} incrementStep={incrementStep} decrementStep={decrementStep} />,
    },
    {
      title: t("Settings:DataImport"),
      description: t("Settings:ImportSectionDescription"),
      component: <FifthStep t={t} incrementStep={incrementStep} decrementStep={decrementStep} />,
    },
    {
      title: t("Settings:DataImportProcessing"),
      description: t("Settings:ImportProcessingDescription"),
      component: (
        <SixthStep
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
      component: <SeventhStep t={t} incrementStep={incrementStep} decrementStep={decrementStep} />,
    },
  ];
};
