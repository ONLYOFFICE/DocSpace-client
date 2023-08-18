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

export const getStepDescription = (t, stepIndex, renderTooltip) => {
  switch (stepIndex) {
    case 1:
      return t("Settings:SelectFileDescription");
    case 2:
      return t("Settings:SelectUsersDescription");
    case 3:
      return (
        <>
          {t("Settings:SelectUserTypesDescription")}
          {renderTooltip}
        </>
      );
    case 4:
      return t("Settings:ImportSectionDescription");
    case 5:
      return t("Settings:ImportProcessingDescription");
    case 6:
      return t("Settings:ImportCompleteDescription");
    default:
      return;
  }
};
