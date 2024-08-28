// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
import DataImportLoader from "./sub-components/DataImportLoader";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";

const DataImport = ({
  t,
  theme,
  services,
  setServices,
  getMigrationList,
  getMigrationStatus,
  isMigrationInit,
  setIsMigrationInit,
  tReady,
}) => {
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

    if (
      migrationStatus &&
      migrationStatus.parseResult?.failedArchives &&
      migrationStatus.parseResult.failedArchives.length === 0 &&
      !migrationStatus.error
    ) {
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
    setIsMigrationInit(true);
    setServices(migrationList);
  };

  useEffect(() => {
    handleMigrationCheck();
  }, []);

  useEffect(() => {
    if (tReady) setDocumentTitle(t("DataImport"));
  }, [tReady]);

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

  if (!isMigrationInit) return <DataImportLoader />;
  return (
    <WorkspacesContainer>
      <Text className="data-import-description">
        {t("DataImportDescription", {
          productName: t("Common:ProductName"),
          organizationName: t("Common:OrganizationName"),
        })}
      </Text>
      <Text className="data-import-subtitle">{t("UploadBackupData")}</Text>

      <Box className="workspace-list">
        {workspaces.map((workspace) => (
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
  const {
    services,
    setServices,
    getMigrationList,
    getMigrationStatus,
    isMigrationInit,
    setIsMigrationInit,
  } = importAccountsStore;

  const { theme } = settingsStore;

  return {
    services,
    setServices,
    getMigrationList,
    getMigrationStatus,
    theme,
    isMigrationInit,
    setIsMigrationInit,
  };
})(withTranslation(["Settings"])(observer(DataImport)));
