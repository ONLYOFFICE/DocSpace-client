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

import { useState, useEffect, useMemo, useCallback } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";

import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";
import { Box } from "@docspace/shared/components/box";
import { Text } from "@docspace/shared/components/text";

import GoogleWorkspaceSvgUrl from "PUBLIC_DIR/images/workspace.google.react.svg?url";
import NextcloudWorkspaceSvgUrl from "PUBLIC_DIR/images/workspace.nextcloud.react.svg?url";
import WorkspaceSvgUrl from "PUBLIC_DIR/images/workspace.onlyoffice.react.svg?url";
import GoogleWorkspaceDarkSvgUrl from "PUBLIC_DIR/images/dark.workspace.google.react.svg?url";
import NextcloudWorkspaceDarkSvgUrl from "PUBLIC_DIR/images/dark.workspace.nextcloud.react.svg?url";
import WorkspaceDarkSvgUrl from "PUBLIC_DIR/images/dark.workspace.onlyoffice.react.svg?url";

import { LinkType } from "@docspace/shared/components/link/Link.enums";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import DataImportLoader from "../sub-components/DataImportLoader";
import { WorkspacesContainer } from "../StyledDataImport";
import { ProvidersProps, InjectedProvidersProps } from "../types";

const Providers = (props: ProvidersProps) => {
  const {
    theme,
    services,
    setServices,
    getMigrationList,
    setWorkspace,
    logoText,
  } = props as InjectedProvidersProps;

  const [areProvidersReady, setAreProvidersReady] = useState(false);

  const { t, ready } = useTranslation(["Settings"]);

  const workspaces = useMemo(() => {
    const logos = {
      GoogleWorkspace: theme.isBase
        ? GoogleWorkspaceSvgUrl
        : GoogleWorkspaceDarkSvgUrl,
      Nextcloud: theme.isBase
        ? NextcloudWorkspaceSvgUrl
        : NextcloudWorkspaceDarkSvgUrl,
      Workspace: theme.isBase ? WorkspaceSvgUrl : WorkspaceDarkSvgUrl,
    };

    return services.map((service) => ({
      title: service,
      logo: logos[service],
    }));
  }, [theme.isBase, services]);

  const handleMigrationCheck = useCallback(async () => {
    const migrationList = await getMigrationList();
    setAreProvidersReady(true);
    setServices(migrationList);
  }, [getMigrationList, setServices]);

  useEffect(() => {
    handleMigrationCheck();
  }, [handleMigrationCheck]);

  useEffect(() => {
    if (ready) setDocumentTitle(t("DataImport"));
  }, [ready, t]);

  if (!areProvidersReady) return <DataImportLoader />;
  return (
    <WorkspacesContainer>
      <Text className="data-import-description">
        {t("DataImportDescription", {
          productName: t("Common:ProductName"),
          organizationName: logoText,
        })}
      </Text>
      <Text className="data-import-subtitle">{t("UploadBackupData")}</Text>

      <Box className="workspace-list">
        {workspaces.map((workspace) => (
          <Box
            key={workspace.title}
            className="workspace-item"
            onClick={() => setWorkspace(workspace.title)}
          >
            <ReactSVG src={workspace.logo} className="workspace-logo" />

            <ColorTheme
              tag="a"
              themeId={ThemeId.Link}
              type={LinkType.page}
              fontWeight="600"
              isHovered
              isTextOverflow
            >
              {t("Import")}
            </ColorTheme>
          </Box>
        ))}
      </Box>
    </WorkspacesContainer>
  );
};
export const Component = inject<TStore>(
  ({ settingsStore, importAccountsStore }) => {
    const { services, setServices, getMigrationList, setWorkspace } =
      importAccountsStore;

    const { theme, logoText } = settingsStore;

    return {
      services,
      setServices,
      getMigrationList,
      logoText,
      theme,
      setWorkspace,
    };
  },
)(observer(Providers));
