import { Trans } from "react-i18next";

export const getStepTitle = (t, stepIndex) => {
  switch (stepIndex) {
    case 1:
      return t("Common:SelectFile");
    case 2:
      return t("Settings:SelectUsers");
    case 3:
      return t("Settings:SelectUserTypes");
    case 4:
      return t("Settings:DataImport");
    case 5:
      return t("Settings:DataImportProcessing");
    case 6:
      return t("Settings:DataImportComplete");
    default:
      return;
  }
};

export const getStepDescription = (t, stepIndex) => {
  switch (stepIndex) {
    case 1:
      return <Trans i18nKey="SelectFileDescription" ns="Settings" t={t} />;
    case 2:
      return <Trans i18nKey="SelectUsersDescription" ns="Settings" t={t} />;
    case 3:
      return <Trans i18nKey="SelectUserTypesDescription" ns="Settings" t={t} />;
    case 4:
      return <Trans i18nKey="SelectSectionsDescription" ns="Settings" t={t} />;
    case 5:
      return <Trans i18nKey="DataImportProcessingDescription" ns="Settings" t={t} />
    case 6: 
      return <Trans i18nKey="DataImportCompleteDescription" ns="Settings" t={t} />
    default:
      return;
  }
};
