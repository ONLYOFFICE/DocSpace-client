import { useEffect, useMemo } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";

import { Link } from "@docspace/shared/components/link";
import { Box } from "@docspace/shared/components/box";
import { Text } from "@docspace/shared/components/text";
import { WorkspacesContainer } from "./StyledDataImport";

import GoogleWorkspaceSvgUrl from "PUBLIC_DIR/images/workspace.google.react.svg?url";
import NextcloudWorkspaceSvgUrl from "PUBLIC_DIR/images/workspace.nextcloud.react.svg?url";
import OnlyofficeWorkspaceSvgUrl from "PUBLIC_DIR/images/workspace.onlyoffice.react.svg?url";
import GoogleWorkspaceDarkSvgUrl from "PUBLIC_DIR/images/dark.workspace.google.react.svg?url";
import NextcloudWorkspaceDarkSvgUrl from "PUBLIC_DIR/images/dark.workspace.nextcloud.react.svg?url";
import OnlyofficeWorkspaceDarkSvgUrl from "PUBLIC_DIR/images/dark.workspace.onlyoffice.react.svg?url";

const DataImport = ({
  t,
  theme,
  services,
  setServices,
  getMigrationList,
  getMigrationStatus,
  setDocumentTitle,
}) => {
  setDocumentTitle(t("DataImport"));

  const navigate = useNavigate();

  const google = theme.isBase
    ? GoogleWorkspaceSvgUrl
    : GoogleWorkspaceDarkSvgUrl;

  const nextcloud = theme.isBase
    ? NextcloudWorkspaceSvgUrl
    : NextcloudWorkspaceDarkSvgUrl;

  const onlyoffice = theme.isBase
    ? OnlyofficeWorkspaceSvgUrl
    : OnlyofficeWorkspaceDarkSvgUrl;

  const logos = {
    GoogleWorkspace: google,
    Nextcloud: nextcloud,
    Workspace: onlyoffice,
  };

  const workspaces = useMemo(() => {
    return services.map((service) => ({
      title: service,
      logo: logos[service],
    }));
  }, [theme.isBase, services]);

  const handleMigrationCheck = async () => {
    const migrationStatus = await getMigrationStatus();

    if (migrationStatus) {
      const workspacesEnum = {
        GoogleWorkspace: "google",
        Nextcloud: "nextcloud",
        Workspace: "onlyoffice",
      };
      const migratorName = migrationStatus.parseResult.migratorName;

      navigate(`${workspacesEnum[migratorName]}?service=${migratorName}`);

      return;
    }

    const migrationList = await getMigrationList();
    setServices(migrationList);
  };

  useEffect(() => {
    handleMigrationCheck();
  }, []);

  const redirectToWorkspace = (title) => {
    switch (title) {
      case "GoogleWorkspace":
        navigate(`google?service=${title}`);
        break;
      case "Nextcloud":
        navigate(`nextcloud?service=${title}`);
        break;
      case "Workspace":
        navigate(`onlyoffice?service=${title}`);
        break;
      default:
        break;
    }
  };

  const filteredWorkspaces = workspaces.filter(
    (workspace) => workspace.title !== "Owncloud",
  );

  return (
    <WorkspacesContainer>
      <Text className="data-import-description">
        {t("DataImportDescription")}
      </Text>
      <Text className="data-import-subtitle">{t("UploadBackupData")}</Text>

      <Box className="workspace-list">
        {filteredWorkspaces.map((workspace) => (
          <Box
            key={workspace.title}
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
              {t("Import")}
            </Link>
          </Box>
        ))}
      </Box>
    </WorkspacesContainer>
  );
};
export default inject(({ authStore, settingsStore, importAccountsStore }) => {
  const { services, setServices, getMigrationList, getMigrationStatus } =
    importAccountsStore;

  const { setDocumentTitle } = authStore;

  return {
    services,
    setServices,
    getMigrationList,
    getMigrationStatus,
    theme: settingsStore.theme,
    setDocumentTitle,
  };
})(withTranslation(["Settings"])(observer(DataImport)));
