import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { ReactSVG } from "react-svg";

import Box from "@docspace/components/box";
import Text from "@docspace/components/text";
import Link from "@docspace/components/link";
import { StyledWrapper } from "./StyledDataImport";

import WorkspaceGoogleSvgUrl from "PUBLIC_DIR/images/workspace.google.react.svg?url";
import WorkspaceNextcloudSvgUrl from "PUBLIC_DIR/images/workspace.nextcloud.react.svg?url";
import WorkspaceOnlyofficeeSvgUrl from "PUBLIC_DIR/images/workspace.onlyoffice.react.svg?url";

const services = [
  {
    id: 1,
    title: "google",
    logo: WorkspaceGoogleSvgUrl,
  },
  {
    id: 2,
    title: "nextcloud",
    logo: WorkspaceNextcloudSvgUrl,
  },
  {
    id: 3,
    title: "onlyoffice",
    logo: WorkspaceOnlyofficeeSvgUrl,
  },
];

const DataImport = (props) => {
  const { t } = props;
  return (
    <StyledWrapper>
      <Text className="data-import-description">
        {t("Settings:DataImportDescription")}
      </Text>
      <Text className="start-migration-text">
        {t("Settings:UploadBackupData")}
      </Text>

      <div className="service-list">
        {services.map((service) => (
          <Box className="service-wrapper" key={service.id}>
            <ReactSVG src={service.logo} />
            <Link
              type="page"
              fontWeight="600"
              color="#4781D1"
              isTextOverflow
              onClick={() => console.log("clicked")}
            >
              {t("Settings:Import")}
            </Link>
          </Box>
        ))}
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
