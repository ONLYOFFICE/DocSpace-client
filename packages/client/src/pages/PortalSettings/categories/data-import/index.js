import { useNavigate } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { ReactSVG } from "react-svg";

import Link from "@docspace/components/link";
import Box from "@docspace/components/box";
import Text from "@docspace/components/text";
import { DataImportWrapper } from "./StyledDataImport";

import WorkspaceGoogleSvgUrl from "PUBLIC_DIR/images/workspace.google.react.svg?url";
import WorkspaceNextcloudSvgUrl from "PUBLIC_DIR/images/workspace.nextcloud.react.svg?url";
import WorkspaceOnlyofficeeSvgUrl from "PUBLIC_DIR/images/workspace.onlyoffice.react.svg?url";

const DataImport = (props) => {
  const { t } = props;
  const navigate = useNavigate();

  const services = [
    { id: 1, logo: WorkspaceGoogleSvgUrl, title: "google" },
    { id: 2, logo: WorkspaceNextcloudSvgUrl, title: "nextcloud" },
    { id: 3, logo: WorkspaceOnlyofficeeSvgUrl, title: "onlyoffice" },
  ];

  const redirectToWorkspace = (title) => {
    switch (title) {
      case "google":
        navigate(window.location.pathname + `/google`);
        break;
      case "nextcloud":
        navigate(window.location.pathname + `/nextcloud`);
        break;
      case "onlyoffice":
        navigate(window.location.pathname + `/onlyoffice`);
        break;
      default:
        break;
    }
  };

  return (
    <DataImportWrapper>
      <Text className="data-import-description">
        {t("Settings:DataImportDescription")}
      </Text>
      <Text className="data-import-subtitle">
        {t("Settings:UploadBackupData")}
      </Text>

      <div className="service-list">
        {services.map((service) => (
          <Box
            className="service-wrapper"
            key={service.id}
            onClick={() => redirectToWorkspace(service.title)}
          >
            <ReactSVG src={service.logo} className="service-icon" />
            <Link
              type="page"
              fontWeight="600"
              color="#4781D1"
              isHovered
              isTextOverflow
            >
              {t("Settings:Import")}
            </Link>
          </Box>
        ))}
      </div>
    </DataImportWrapper>
  );
};

export default inject(({ setup }) => {
  const { initSettings } = setup;
  return {
    initSettings,
  };
})(withTranslation(["Settings"])(observer(DataImport)));
