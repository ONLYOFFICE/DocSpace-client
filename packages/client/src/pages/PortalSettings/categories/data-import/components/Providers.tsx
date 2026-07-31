/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useMemo } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";

import { Text } from "@docspace/ui-kit/components/text";

import GoogleWorkspaceSvgUrl from "PUBLIC_DIR/images/workspace.google.react.svg?url";
import NextcloudWorkspaceSvgUrl from "PUBLIC_DIR/images/thirdparties/nextcloud.svg?url";
import WorkspaceSvgUrl from "PUBLIC_DIR/images/workspace.onlyoffice.react.svg?url";
import GoogleWorkspaceDarkSvgUrl from "PUBLIC_DIR/images/dark.workspace.google.react.svg?url";
import NextcloudWorkspaceDarkSvgUrl from "PUBLIC_DIR/images/dark.workspace.nextcloud.react.svg?url";
import WorkspaceDarkSvgUrl from "PUBLIC_DIR/images/dark.workspace.onlyoffice.react.svg?url";

import { LinkType } from "@docspace/ui-kit/components/link";
import { Link, LinkTarget } from "@docspace/ui-kit/components/link";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import styles from "../StyledDataImport.module.scss";
import DataImportLoader from "../sub-components/DataImportLoader";
import { ProvidersProps, InjectedProvidersProps } from "../types";
import { getBrandName } from "@docspace/shared/constants/brands";

const Providers = (props: ProvidersProps) => {
  const {
    theme,
    services,
    setWorkspace,
    logoText,
    showPortalSettingsLoader,
    dataImportUrl,
    currentColorScheme,
  } = props as InjectedProvidersProps;

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

  useEffect(() => {
    if (ready) setDocumentTitle(t("DataImport"));
  }, [ready, t]);

  if (showPortalSettingsLoader || !ready) return <DataImportLoader />;

  return (
    <div className={styles.workspacesContainer}>
      <Text className="data-import-description">
        {t("DataImportDescription", {
          productName: getBrandName("ProductName"),
          organizationName: logoText,
        })}

        {dataImportUrl ? (
          <Link
            className="link-learn-more"
            color={currentColorScheme?.main?.accent ?? undefined}
            target={LinkTarget.blank}
            isHovered
            href={dataImportUrl}
            fontWeight="600"
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </Text>

      <Text className="data-import-subtitle">{t("UploadBackupData")}</Text>

      <div className="workspace-list">
        {workspaces.map((workspace) => (
          <div
            key={workspace.title}
            className="workspace-item"
            onClick={() => setWorkspace(workspace.title)}
            data-testid={`workspace_item_${workspace.title}`}
          >
            <ReactSVG src={workspace.logo} className="workspace-logo" />

            <Link
              tag="a"
              type={LinkType.page}
              fontWeight="600"
              isHovered
              isTextOverflow
              color="accent"
              dataTestId={`workspace_item_${workspace.title}_import_link`}
            >
              {t("Import")}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
export const Component = inject<TStore>(
  ({ settingsStore, importAccountsStore, clientLoadingStore }) => {
    const { services, setWorkspace } = importAccountsStore;

    const { theme, logoText, dataImportUrl, currentColorScheme } =
      settingsStore;

    const { showPortalSettingsLoader } = clientLoadingStore;

    return {
      services,
      logoText,
      theme,
      setWorkspace,
      showPortalSettingsLoader,
      dataImportUrl,
      currentColorScheme,
    };
  },
)(observer(Providers));
