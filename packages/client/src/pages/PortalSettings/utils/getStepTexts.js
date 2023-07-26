export const getStepTitle = (t, stepIndex) => {
  switch (stepIndex) {
    case 1:
      return t("Common:SelectFile");
    case 2:
      return t("Settings:SelectUsers");
    case 3:
      return t("Settings:DataImport");
    case 4:
      return t("Common:SelectFile");
    case 5:
      return t("Common:SelectFile");
    case 6:
      return t("Common:SelectFile");
    default:
      return;
  }
};

export const getStepDescription = (t, stepIndex) => {
  switch (stepIndex) {
    case 1:
      return t("Settings:SelectFileDescription");
    case 2:
      return t("Settings:SelectUsersDescription");
    case 3:
      return t("Settings:DataImport");
    case 4:
      return t("Common:SelectFile");
    case 5:
      return t("Common:SelectFile");
    case 6:
      return t("Common:SelectFile");
    default:
      return;
  }
};
