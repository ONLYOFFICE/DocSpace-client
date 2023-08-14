import { useNavigate } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";

import Link from "@docspace/components/link";
import Box from "@docspace/components/box";
import Text from "@docspace/components/text";
import { WorkspacesContainer } from "./StyledDataImport";

import GoogleWorkspaceSvgUrl from "PUBLIC_DIR/images/workspace.google.react.svg?url";
import NextcloudWorkspaceSvgUrl from "PUBLIC_DIR/images/workspace.nextcloud.react.svg?url";
import OnlyofficeWorkspaceSvgUrl from "PUBLIC_DIR/images/workspace.onlyoffice.react.svg?url";

const DataImport = (props) => {
  const { t } = props;
  const navigate = useNavigate();

  const workspaces = [
    { id: 1, logo: GoogleWorkspaceSvgUrl, title: "google" },
    { id: 2, logo: NextcloudWorkspaceSvgUrl, title: "nextcloud" },
    { id: 3, logo: OnlyofficeWorkspaceSvgUrl, title: "onlyoffice" },
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
    <WorkspacesContainer>
      <Text className="data-import-description">
        {t("Settings:DataImportDescription")}
      </Text>
      <Text className="data-import-subtitle">
        {t("Settings:UploadBackupData")}
      </Text>

      <Box className="workspace-list">
        {workspaces.map((workspace) => (
          <Box
            key={workspace.id}
            className="workspace-item"
            onClick={() => redirectToWorkspace(workspace.title)}
          >
            <ReactSVG src={workspace.logo} className="workspace-logo" />
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
      </Box>
    </WorkspacesContainer>
  );
};

export default withTranslation(["Settings"])(DataImport);
