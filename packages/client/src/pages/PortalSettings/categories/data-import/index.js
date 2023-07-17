import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { inject, observer } from "mobx-react";

import Text from "@docspace/components/text";
import { StyledWrapper } from "./StyledDataImport";
import ServiceItem from "./sub-components/serviceItem";

import WorkspaceGoogleSvgUrl from "PUBLIC_DIR/images/workspace.google.react.svg?url";
import WorkspaceNextcloudSvgUrl from "PUBLIC_DIR/images/workspace.nextcloud.react.svg?url";
import WorkspaceOnlyofficeeSvgUrl from "PUBLIC_DIR/images/workspace.onlyoffice.react.svg?url";

const DataImport = (props) => {
  const { t } = props;
  const navigate = useNavigate();

  const redirectToGoogleMigration = () => {
    navigate(window.location.pathname + `/google`);
  };
  const redirectToNextcloudMigration = () => {
    navigate(window.location.pathname + `/nextcloud`);
  };
  const redirectToOnlyofficeMigration = () => {
    navigate(window.location.pathname + `/onlyoffice`);
  };

  return (
    <StyledWrapper>
      <Text className="data-import-description">
        {t("Settings:DataImportDescription")}
      </Text>
      <Text fontWeight={600} className="start-migration-text">
        {t("Settings:UploadBackupData")}
      </Text>

      <div className="service-list">
        <ServiceItem
          t={t}
          logo={WorkspaceGoogleSvgUrl}
          onClick={redirectToGoogleMigration}
        />
        <ServiceItem
          t={t}
          logo={WorkspaceNextcloudSvgUrl}
          onClick={redirectToNextcloudMigration}
        />
        <ServiceItem
          t={t}
          logo={WorkspaceOnlyofficeeSvgUrl}
          onClick={redirectToOnlyofficeMigration}
        />
      </div>
    </StyledWrapper>
  );
};

export default inject(({ setup }) => {
  const { initSettings } = setup;
  return {
    initSettings,
  };
})(withTranslation(["Settings"])(observer(DataImport)));
