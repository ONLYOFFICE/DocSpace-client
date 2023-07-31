import FirstStep from "./FirstStep";
import SecondStep from "./SecondStep";
import ThirdStep from "./ThirdStep";
import FourthStep from "./FourthStep";
import FifthStep from "./FifthStep";
import SixthStep from "./SixthStep";

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
      title: t("Common:SelectUsers"),
      description:
        "Select sections for import. They will appear in the corresponding sections of DocSpace.",
      component: <SecondStep t={t} incrementStep={incrementStep} decrementStep={decrementStep} />,
    },
    {
      title: "Add emails to incomplete accounts",
      description:
        "Select sections for import. They will appear in the corresponding sections of DocSpace.",
      component: <ThirdStep t={t} incrementStep={incrementStep} decrementStep={decrementStep} />,
    },
    {
      title: t("Common:SelectUserTypes"),
      description:
        "Select sections for import. They will appear in the corresponding sections of DocSpace.",
      component: <FourthStep t={t} incrementStep={incrementStep} decrementStep={decrementStep} />,
    },
    {
      title: t("Common:DataImport"),
      description:
        "Select sections for import. They will appear in the corresponding sections of DocSpace.",
      component: <FifthStep t={t} incrementStep={incrementStep} decrementStep={decrementStep} />,
    },
    {
      title: t("Common:DataImportProcessing"),
      description:
        "Select sections for import. They will appear in the corresponding sections of DocSpace.",
      component: <SixthStep t={t} incrementStep={incrementStep} decrementStep={decrementStep} />,
    },
    {
      title: t("Common:DataImportComplete"),
      description:
        "Select sections for import. They will appear in the corresponding sections of DocSpace.",
      component: <SixthStep t={t} incrementStep={incrementStep} decrementStep={decrementStep} />,
    },
  ];
};
