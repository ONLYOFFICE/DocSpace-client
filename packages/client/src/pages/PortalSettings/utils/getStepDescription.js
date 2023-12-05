export const getGoogleStepDescription = (t, stepIndex, renderTooltip, Trans) => {
  switch (stepIndex) {
    case 1:
      return t("Settings:SelectFileDescriptionGoogle");
    case 2:
      return t("Settings:SelectUsersDescriptionGoogle");
    case 3:
      return (
        <>
          <Trans t={t} ns="Settings" i18nKey="SelectUserTypesDescription">
            Select DocSpace roles for the imported users: <b>DocSpace admin</b>, <b>Room admin</b>
            or <b>Power user</b>. By default, Power user role is selected for each user. You can
            manage the roles after the import.
          </Trans>
          {renderTooltip}
        </>
      );
    case 4:
      return t("Settings:ImportSectionDescription");
    case 5:
      return t("Settings:ImportProcessingDescription");
    case 6:
      return t("Settings:ImportCompleteDescriptionGoogle");
    default:
      return;
  }
};

export const getWorkspaceStepDescription = (t, stepIndex, renderTooltip) => {
  switch (stepIndex) {
    case 1:
      return t("Settings:SelectFileDescriptionWorkspace");
    case 2:
      return t("Settings:SelectUsersDescriptionWorkspace");
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
      return t("Settings:ImportCompleteDescriptionWorkspace");
    default:
      return;
  }
};
