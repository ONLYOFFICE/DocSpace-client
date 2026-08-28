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
import type { TIntegrationsEntries } from "@docspace/shared/api/settings/types";

import type { IntegrationPlatform } from "SRC_DIR/components/IntegrationsCard/integrations-catalog";

import ZoomLogoUrl from "PUBLIC_DIR/images/logo_zoom.svg?url";
import WordpressLogoUrl from "PUBLIC_DIR/images/logo_wordpress.svg?url";
import DrupalLogoUrl from "PUBLIC_DIR/images/logo_drupal.svg?url";
import MoodleLogoUrl from "PUBLIC_DIR/images/logo_moodle.svg?url";
import MondayLogoUrl from "PUBLIC_DIR/images/logo_monday.svg?url";
import PipedriveLogoUrl from "PUBLIC_DIR/images/logo_pipedrive.svg?url";
import ZapierLogoUrl from "PUBLIC_DIR/images/logo_zapier.svg?url";
import N8nLogoUrl from "PUBLIC_DIR/images/logo_n8n.svg?url";

const GITHUB_URL = "https://github.com/ONLYOFFICE";

const ZOOM = "Zoom";
const WORDPRESS = "WordPress";
const DRUPAL = "Drupal";
const PIPEDRIVE = "Pipedrive";
const MONDAY = "monday.com";
const ZAPIER = "Zapier";

type CatalogUrls = {
  integrationsEntries?: TIntegrationsEntries;
  moodleUrl?: string;
  allConnectorsUrl?: string;
};

export const useSdkConnectors = (
  t: TFunction,
  urls: CatalogUrls,
): IntegrationPlatform[] => {
  const { integrationsEntries, moodleUrl, allConnectorsUrl } = urls;

  return React.useMemo(() => {
    const organizationName = getBrandName("OrganizationName");
    const productName = getBrandName("ProductName");

    const embedStepsFor = (serviceName: string) => [
      {
        id: "install",
        text: t("JavascriptSdk:ConnectorInstallStep", {
          organizationName,
          productName,
          serviceName,
        }),
      },
      { id: "connect", text: t("JavascriptSdk:ConnectorConnectStep") },
      { id: "customize", text: t("JavascriptSdk:ConnectorCustomizeStep") },
    ];

    const automateStepsFor = (serviceName: string) => [
      {
        id: "install",
        text: t("JavascriptSdk:ConnectorAutomateInstallStep", {
          organizationName,
          productName,
          serviceName,
        }),
      },
      {
        id: "credentials",
        text: t("JavascriptSdk:ConnectorAutomateCredentialsStep"),
      },
      { id: "build", text: t("JavascriptSdk:ConnectorAutomateBuildStep") },
    ];

    const embed = (
      id: string,
      name: string,
      iconUrl: string,
      url?: string,
    ): IntegrationPlatform => ({
      id,
      name,
      iconUrl,
      url,
      subtitle: t("JavascriptSdk:ConnectorEmbedSubtitle", {
        organizationName,
        productName,
        serviceName: name,
      }),
      steps: embedStepsFor(name),
      githubUrl: GITHUB_URL,
    });

    const automate = (
      id: string,
      name: string,
      iconUrl: string,
      url?: string,
    ): IntegrationPlatform => ({
      id,
      name,
      iconUrl,
      url,
      subtitle: t("JavascriptSdk:ConnectorAutomateSubtitle", {
        organizationName,
        productName,
        serviceName: name,
      }),
      steps: automateStepsFor(name),
      githubUrl: GITHUB_URL,
    });

    return [
      embed("zoom", ZOOM, ZoomLogoUrl, integrationsEntries?.zoom),
      embed(
        "wordpress",
        WORDPRESS,
        WordpressLogoUrl,
        integrationsEntries?.wordpress,
      ),
      embed("drupal", DRUPAL, DrupalLogoUrl, integrationsEntries?.drupal),
      embed("moodle", getBrandName("Moodle"), MoodleLogoUrl, moodleUrl),
      embed(
        "pipedrive",
        PIPEDRIVE,
        PipedriveLogoUrl,
        integrationsEntries?.pipedrive,
      ),
      embed("monday", MONDAY, MondayLogoUrl, allConnectorsUrl),
      automate("zapier", ZAPIER, ZapierLogoUrl, integrationsEntries?.zapier),
      automate("n8n", getBrandName("N8n"), N8nLogoUrl, allConnectorsUrl),
    ];
  }, [t, integrationsEntries, moodleUrl, allConnectorsUrl]);
};

export default useSdkConnectors;
