import FirstStep from "./FirstStep";
import SecondStep from "./SecondStep";
import ThirdStep from "./ThirdStep";
import FourthStep from "./FourthStep";
import FifthStep from "./FifthStep";
import SixthStep from "./SixthStep";
import SeventhStep from "./SeventhStep";

import HelpButton from "@docspace/components/help-button";
import Text from "@docspace/components/text";

export const getStepsData = (t, currentStep, setCurrentStep) => {
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
      title: t("Settings:SelectUsers"),
      description: t("Settings:SelectUsersDescriptionNextcloud"),
      component: <SecondStep t={t} incrementStep={incrementStep} decrementStep={decrementStep} />,
    },
    {
      title: t("Settings:AddEmails"),
      description: t("Settings:SelectUsersDescriptionNextcloud"),
      component: <ThirdStep t={t} incrementStep={incrementStep} decrementStep={decrementStep} />,
    },
    {
      title: t("Settings:SelectUserTypes"),
      description: (
        <>
          {t("Settings:SelectUserTypesDescription")}
          <HelpButton
            place="right"
            offsetRight={0}
            tooltipContent={<Text>Insert tooltip content</Text>}
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
      component: <SixthStep t={t} incrementStep={incrementStep} decrementStep={decrementStep} />,
    },
    {
      title: t("Settings:DataImportComplete"),
      description: t("Settings:ImportCompleteDescriptionNextcloud"),
      component: <SeventhStep t={t} incrementStep={incrementStep} decrementStep={decrementStep} />,
    },
  ];
};
