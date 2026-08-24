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

import React from "react";
import type { TFunction } from "i18next";

import { getBrandName } from "@docspace/shared/constants/brands";

import NextcloudLogoUrl from "PUBLIC_DIR/images/logo_nextcloud.svg?url";
import OwnCloudLogoUrl from "PUBLIC_DIR/images/logo_ownCloud.svg?url";
import ConfluenceLogoUrl from "PUBLIC_DIR/images/logo_confluence.svg?url";
import AlfrescoLogoUrl from "PUBLIC_DIR/images/logo_alfresco.svg?url";
import MoodleLogoUrl from "PUBLIC_DIR/images/logo_moodle.svg?url";
import N8nLogoUrl from "PUBLIC_DIR/images/logo_n8n.svg?url";

export type IntegrationStep = {
  id: string;
  text: string;
};

export type IntegrationPlatform = {
  id: string;
  name: string;
  iconUrl?: string;
  url?: string;
  githubUrl?: string;
  subtitle: string;
  steps: IntegrationStep[];
  // "Your own platform" has no ready-made connector to install and no repo to
  // browse, so its dialog drops the "Create instance"/GitHub/"Learn more"
  // footer for a single secondary button pointing at the Docs API reference.
  docsApiUrl?: string;
};

type CatalogUrls = {
  nextcloudUrl?: string;
  owncloudUrl?: string;
  confluenceUrl?: string;
  alfrescoUrl?: string;
  moodleUrl?: string;
  allConnectorsUrl?: string;
  docsApiUrl?: string;
};

export const useIntegrationPlatforms = (
  t: TFunction,
  urls: CatalogUrls,
): IntegrationPlatform[] => {
  const {
    nextcloudUrl,
    owncloudUrl,
    confluenceUrl,
    alfrescoUrl,
    moodleUrl,
    allConnectorsUrl,
    docsApiUrl,
  } = urls;

  const createInstanceStep = t("Common:IntegrationCreateStep", {
    serviceName: t("DocsConnect:DocsConnect"),
    devPack: t("DocsConnect:DevPack"),
  });

  return React.useMemo(
    () => [
      {
        id: "nextcloud",
        name: getBrandName("Nextcloud"),
        iconUrl: NextcloudLogoUrl,
        url: nextcloudUrl,
        subtitle: t("Common:IntegrationServiceHeader", {
          serviceName: getBrandName("Nextcloud"),
        }),
        steps: [
          { id: "instance", text: createInstanceStep },
          {
            id: "install",
            text: t("Common:IntegrationInstallStep", {
              organizationName: getBrandName("OrganizationName"),
              serviceName: getBrandName("Nextcloud"),
            }),
          },
          {
            id: "configure",
            text: t("Common:IntegrationConfigureNextcloudStep", {
              organizationName: getBrandName("OrganizationName"),
            }),
          },
        ],
        githubUrl: "https://github.com/ONLYOFFICE",
      },
      {
        id: "owncloud",
        name: getBrandName("OwnCloud"),
        iconUrl: OwnCloudLogoUrl,
        url: owncloudUrl,
        subtitle: t("Common:IntegrationServiceHeader", {
          serviceName: getBrandName("OwnCloud"),
        }),
        steps: [
          { id: "instance", text: createInstanceStep },
          {
            id: "install",
            text: t("Common:IntegrationInstallStep", {
              organizationName: getBrandName("OrganizationName"),
              serviceName: getBrandName("OwnCloud"),
            }),
          },
          {
            id: "configure",
            text: t("Common:IntegrationConfigureOwnCloudStep", {
              organizationName: getBrandName("OrganizationName"),
            }),
          },
        ],
        githubUrl: "https://github.com/ONLYOFFICE",
      },
      {
        id: "confluence",
        name: getBrandName("Confluence"),
        iconUrl: ConfluenceLogoUrl,
        url: confluenceUrl,
        subtitle: t("Common:IntegrationServiceHeader", {
          serviceName: getBrandName("Confluence"),
        }),
        steps: [
          { id: "instance", text: createInstanceStep },
          {
            id: "install",
            text: t("Common:IntegrationInstallConfluenceStep", {
              organizationName: getBrandName("OrganizationName"),
            }),
          },
          {
            id: "configure",
            text: t("Common:IntegrationConfigureConfluenceStep", {
              organizationName: getBrandName("OrganizationName"),
            }),
          },
        ],
        githubUrl: "https://github.com/ONLYOFFICE",
      },
      {
        id: "alfresco",
        name: getBrandName("Alfresco"),
        iconUrl: AlfrescoLogoUrl,
        url: alfrescoUrl,
        subtitle: t("Common:IntegrationServiceHeader", {
          serviceName: getBrandName("Alfresco"),
        }),
        steps: [
          { id: "instance", text: createInstanceStep },
          {
            id: "install",
            text: t("Common:IntegrationInstallAlfrescoStep", {
              organizationName: getBrandName("OrganizationName"),
            }),
          },
          {
            id: "configure",
            text: t("Common:IntegrationConfigureAlfrescoStep", {
              organizationName: getBrandName("OrganizationName"),
            }),
          },
        ],
        githubUrl: "https://github.com/ONLYOFFICE",
      },
      {
        id: "moodle",
        name: getBrandName("Moodle"),
        iconUrl: MoodleLogoUrl,
        url: moodleUrl,
        subtitle: t("Common:IntegrationServiceHeader", {
          serviceName: getBrandName("Moodle"),
        }),
        steps: [
          { id: "instance", text: createInstanceStep },
          {
            id: "install",
            text: t("Common:IntegrationInstallMoodleStep", {
              organizationName: getBrandName("OrganizationName"),
              moduleName: getBrandName("MoodleModuleName"),
            }),
          },
          {
            id: "configure",
            text: t("Common:IntegrationConfigureMoodleStep", {
              organizationName: getBrandName("OrganizationName"),
            }),
          },
        ],
        githubUrl: "https://github.com/ONLYOFFICE",
      },
      {
        id: "n8n",
        name: getBrandName("N8n"),
        iconUrl: N8nLogoUrl,
        url: allConnectorsUrl,
        subtitle: t("Common:IntegrationAutomateHeader", {
          organizationName: getBrandName("OrganizationName"),
          productName: getBrandName("ProductName"),
        }),
        steps: [
          { id: "instance", text: createInstanceStep },
          {
            id: "install",
            text: t("Common:IntegrationInstallN8NStep", {
              organizationName: getBrandName("OrganizationName"),
              productName: getBrandName("ProductName"),
              packageName: getBrandName("N8nPackageName"),
            }),
          },
          {
            id: "configure",
            text: t("Common:IntegrationConfigureN8NStep", {
              organizationName: getBrandName("OrganizationName"),
              productName: getBrandName("ProductName"),
            }),
          },
        ],
        githubUrl: "https://github.com/ONLYOFFICE",
      },
      {
        id: "custom",
        name: t("Common:YourOwnPlatform"),
        subtitle: t("Common:IntegrationOwnHeader", {
          organizationName: getBrandName("OrganizationName"),
          productName: getBrandName("ProductName"),
        }),
        steps: [
          { id: "instance", text: createInstanceStep },
          {
            id: "build",
            text: t("Common:IntegrationInstallOwnStep", {
              organizationName: getBrandName("OrganizationName"),
              productName: getBrandName("ProductName"),
            }),
          },
          { id: "connect", text: t("Common:IntegrationConfigureOwnStep") },
        ],
        // No connector to create and no repo to browse for a self-built
        // integration: the footer is just the API reference.
        docsApiUrl,
      },
    ],
    [
      t,
      createInstanceStep,
      nextcloudUrl,
      owncloudUrl,
      confluenceUrl,
      alfrescoUrl,
      moodleUrl,
      allConnectorsUrl,
      docsApiUrl,
    ],
  );
};

