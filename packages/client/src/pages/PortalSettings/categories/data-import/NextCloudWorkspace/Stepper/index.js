import FirstStep from "./FirstStep";
import SecondStep from "./SecondStep";
import ThirdStep from "./ThirdStep";
import FourthStep from "./FourthStep";
import FifthStep from "./FifthStep";
import SixthStep from "./SixthStep";

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
      description:
        "Select the Nextcloud backup file to start the data import. Only one file can be selected. Once the data upload and analysis are complete, the next step will be initiated automatically.",
      component: <FirstStep t={t} incrementStep={incrementStep} decrementStep={decrementStep} />,
    },
    {
      title: "Select users with e-mail",
      description:
        "Check users from the list to import into ONLYOFFICE DocSpace. Only users with emails can be selected. Users already existing in ONLYOFFICE DocSpace are highlighted with a green color and are not checked by default.",
      component: <SecondStep t={t} incrementStep={incrementStep} decrementStep={decrementStep} />,
    },
    {
      title: "Add emails to incomplete accounts",
      description:
        "Check users from the list to import into ONLYOFFICE DocSpace. Only users with emails can be selected. Users already existing in ONLYOFFICE DocSpace are highlighted with a green color and are not checked by default.",
      component: <ThirdStep t={t} incrementStep={incrementStep} decrementStep={decrementStep} />,
    },
    {
      title: "Select user types",
      description: (
        <>
          Select DocSpace roles for the imported users: DocSpace admin, Room admin or Power user. By
          default, Power user role is selected for each user. You can manage the roles after the
          import.
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
      title: "Data import",
      description:
        "Select sections for import. They will appear in the corresponding sections of DocSpace.",
      component: <FifthStep t={t} incrementStep={incrementStep} decrementStep={decrementStep} />,
    },
    {
      title: "Processing of data import",
      description: "Data migration in progress. Please wait.",
      component: <SixthStep t={t} incrementStep={incrementStep} decrementStep={decrementStep} />,
    },
    {
      title: "Data import complete",
      description: "Data import from NextCloud to ONLYOFFICE DocSpace is complete!",
      component: <SixthStep t={t} incrementStep={incrementStep} decrementStep={decrementStep} />,
    },
  ];
};
