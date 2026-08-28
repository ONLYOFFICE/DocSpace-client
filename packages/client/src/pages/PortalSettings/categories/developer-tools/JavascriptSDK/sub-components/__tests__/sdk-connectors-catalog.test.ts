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

import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import type { TFunction } from "i18next";

import type { TIntegrationsEntries } from "@docspace/shared/api/settings/types";

import { useSdkConnectors } from "../sdk-connectors-catalog";

// The catalog only ever passes serviceName as a distinguishing variable, so
// echoing the key with it is enough to tell embed steps from automate ones.
const t = ((key: string, options?: Record<string, string>) =>
  options?.serviceName
    ? `${key}|${options.serviceName}`
    : key) as unknown as TFunction;

const INTEGRATIONS_ENTRIES = {
  drupal: "https://drupal.example/onlyoffice",
  pipedrive: "https://pipedrive.example/onlyoffice",
  wordpress: "https://wordpress.example/onlyoffice",
  zapier: "https://zapier.example/onlyoffice",
  zoom: "https://zoom.example/onlyoffice",
} as unknown as TIntegrationsEntries;

const NEXTCLOUD_URL = "https://site.example/nextcloud";
const OWNCLOUD_URL = "https://site.example/owncloud";
const CONFLUENCE_URL = "https://site.example/confluence";
const ALFRESCO_URL = "https://site.example/alfresco";
const MOODLE_URL = "https://site.example/moodle";
const ALL_CONNECTORS_URL = "https://site.example/all-connectors";

const URLS = {
  integrationsEntries: INTEGRATIONS_ENTRIES,
  nextcloudUrl: NEXTCLOUD_URL,
  owncloudUrl: OWNCLOUD_URL,
  confluenceUrl: CONFLUENCE_URL,
  alfrescoUrl: ALFRESCO_URL,
  moodleUrl: MOODLE_URL,
  allConnectorsUrl: ALL_CONNECTORS_URL,
};

const renderCatalog = (urls: Parameters<typeof useSdkConnectors>[1] = URLS) =>
  renderHook(
    ({ value }: { value: Parameters<typeof useSdkConnectors>[1] }) =>
      useSdkConnectors(t, value),
    { initialProps: { value: urls } },
  );

describe("useSdkConnectors", () => {
  it("lists the connectors in catalog order", () => {
    const { result } = renderCatalog();

    expect(result.current.map((connector) => connector.id)).toEqual([
      "nextcloud",
      "owncloud",
      "confluence",
      "alfresco",
      "moodle",
      "n8n",
      "drupal",
      "monday",
      "pipedrive",
      "wordpress",
      "zapier",
      "zoom",
    ]);

    expect(result.current.map((connector) => connector.name)).toEqual([
      "Nextcloud",
      "ownCloud",
      "Confluence",
      "Alfresco",
      "Moodle",
      "n8n",
      "Drupal",
      "monday.com",
      "Pipedrive",
      "WordPress",
      "Zapier",
      "Zoom",
    ]);
  });

  it("takes connector pages from externalResources", () => {
    const { result } = renderCatalog();

    const urlById = Object.fromEntries(
      result.current.map((connector) => [connector.id, connector.url]),
    );

    expect(urlById).toMatchObject({
      zoom: INTEGRATIONS_ENTRIES.zoom,
      wordpress: INTEGRATIONS_ENTRIES.wordpress,
      drupal: INTEGRATIONS_ENTRIES.drupal,
      pipedrive: INTEGRATIONS_ENTRIES.pipedrive,
      zapier: INTEGRATIONS_ENTRIES.zapier,
      nextcloud: NEXTCLOUD_URL,
      owncloud: OWNCLOUD_URL,
      confluence: CONFLUENCE_URL,
      alfresco: ALFRESCO_URL,
      moodle: MOODLE_URL,
    });
  });

  it("falls back to the connectors catalog where there is no dedicated page", () => {
    const { result } = renderCatalog();

    const urlById = Object.fromEntries(
      result.current.map((connector) => [connector.id, connector.url]),
    );

    expect(urlById.monday).toBe(ALL_CONNECTORS_URL);
    expect(urlById.n8n).toBe(ALL_CONNECTORS_URL);
  });

  it("leaves the url empty when externalResources has no entries", () => {
    const { result } = renderCatalog({});

    const withoutUrl = result.current
      .filter((connector) => !connector.url)
      .map((connector) => connector.id);

    expect(withoutUrl).toEqual([
      "nextcloud",
      "owncloud",
      "confluence",
      "alfresco",
      "moodle",
      "n8n",
      "drupal",
      "monday",
      "pipedrive",
      "wordpress",
      "zapier",
      "zoom",
    ]);
  });

  it("splits embedding connectors from automation ones", () => {
    const { result } = renderCatalog();

    const byId = Object.fromEntries(
      result.current.map((connector) => [connector.id, connector]),
    );

    expect(byId.zoom.subtitle).toBe(
      "JavascriptSdk:ConnectorEmbedSubtitle|Zoom",
    );
    expect(byId.zoom.steps.map((step) => step.id)).toEqual([
      "install",
      "connect",
      "customize",
    ]);
    expect(byId.zoom.steps[0].text).toBe(
      "JavascriptSdk:ConnectorInstallStep|Zoom",
    );

    expect(byId.zapier.subtitle).toBe(
      "JavascriptSdk:ConnectorAutomateSubtitle|Zapier",
    );
    expect(byId.zapier.steps.map((step) => step.id)).toEqual([
      "install",
      "credentials",
      "build",
    ]);
    expect(byId.zapier.steps[0].text).toBe(
      "JavascriptSdk:ConnectorAutomateInstallStep|Zapier",
    );

    expect(byId.n8n.subtitle).toBe(
      "JavascriptSdk:ConnectorAutomateSubtitle|n8n",
    );
  });

  it("gives every connector an icon, a repository and three steps", () => {
    const { result } = renderCatalog();

    for (const connector of result.current) {
      expect(connector.iconUrl).toBeTruthy();
      expect(connector.githubUrl).toBe("https://github.com/ONLYOFFICE");
      expect(connector.steps).toHaveLength(3);
      // The done-state marker in IntegrationDialog is keyed on "instance",
      // which only Docs Connect can provision.
      expect(connector.steps.map((step) => step.id)).not.toContain("instance");
      expect(connector.docsApiUrl).toBeUndefined();
    }
  });

  it("rebuilds only when the urls change", () => {
    const { result, rerender } = renderCatalog();

    const first = result.current;

    rerender({ value: URLS });
    expect(result.current).toBe(first);

    rerender({
      value: { ...URLS, allConnectorsUrl: "https://site.example/connectors" },
    });
    expect(result.current).not.toBe(first);
    expect(
      result.current.find((connector) => connector.id === "monday")?.url,
    ).toBe("https://site.example/connectors");
  });
});
