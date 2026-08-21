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

// (c) Copyright Ascensio System SIA 2009-2026
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

import React from "react";
import { inject, observer } from "mobx-react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { CollapsibleCard } from "@docspace/ui-kit/components/collapsible-card";
import { Text } from "@docspace/ui-kit/components/text";
import { getBrandName } from "@docspace/shared/constants/brands";

import ArrowIcon from "PUBLIC_DIR/images/arrow2.react.svg";
import PluginIcon from "PUBLIC_DIR/images/icons/20/catalog.devtools-plugin-sdk.react.svg";

import { MORE_CONNECTORS_COUNT } from "SRC_DIR/pages/PortalSettings/categories/developer-tools/DocsConnect/constants";

import { IntegrationDialog } from "./IntegrationDialog";
import {
  useIntegrationPlatforms,
  type IntegrationPlatform,
} from "./integrations-catalog";
import styles from "../Dashboard.module.scss";

const DOCS_CONNECT_PATH = "/developer-tools/docs-connect";

type PlatformTileProps = {
  name: string;
  iconUrl?: string;
  iconAlt?: string;
  hideIcon?: boolean;
  isBold?: boolean;
  linkLabel?: string;
  href?: string;
  onClick?: () => void;
  testId?: string;
};

const PlatformTile = ({
  name,
  iconUrl,
  iconAlt,
  hideIcon = false,
  isBold = false,
  linkLabel,
  href,
  onClick,
  testId,
}: PlatformTileProps) => {
  const content = (
    <>
      {hideIcon ? null : (
        <span
          className={styles.integrationIcon}
          data-fallback={iconUrl ? undefined : "true"}
        >
          {iconUrl ? (
            <img src={iconUrl} alt={iconAlt ?? ""} />
          ) : (
            <PluginIcon aria-hidden="true" />
          )}
        </span>
      )}
      <Text
        as="span"
        className={styles.integrationName}
        isBold={isBold}
        truncate
        title={name}
      >
        {name}
      </Text>
      {linkLabel ? (
        <span className={styles.integrationLink}>
          {linkLabel}
          <ArrowIcon aria-hidden="true" className={styles.integrationArrow} />
        </span>
      ) : (
        <ArrowIcon aria-hidden="true" className={styles.integrationArrow} />
      )}
    </>
  );

  if (href)
    return (
      <a
        className={styles.integrationTile}
        data-variant={hideIcon ? "no-icon" : undefined}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={testId}
      >
        {content}
      </a>
    );

  return (
    <button
      type="button"
      className={styles.integrationTile}
      data-variant={hideIcon ? "no-icon" : undefined}
      onClick={onClick}
      data-testid={testId}
    >
      {content}
    </button>
  );
};

interface IntegrationsCardProps {
  isAdminOrOwner?: boolean;
  nextcloudUrl?: string;
  owncloudUrl?: string;
  confluenceUrl?: string;
  alfrescoUrl?: string;
  moodleUrl?: string;
  allConnectorsUrl?: string;
  docsApiUrl?: string;
}

const IntegrationsCardComponent = (props: IntegrationsCardProps) => {
  const { allConnectorsUrl, isAdminOrOwner = false } = props;
  const { t } = useTranslation(["Common", "DocsConnect"]);
  const navigate = useNavigate();

  const platforms = useIntegrationPlatforms(t, props);

  const [openPlatform, setOpenPlatform] =
    React.useState<IntegrationPlatform | null>(null);

  const closeDialog = React.useCallback(() => setOpenPlatform(null), []);

  // Docs Connect lives under the portal's developer tools, which only admins
  // and the owner can open — everyone else would land on /error/403. Same gate
  // the "or connect Docs" subtitle link uses.
  const onCreateInstance = React.useCallback(() => {
    if (!isAdminOrOwner) return;
    setOpenPlatform(null);
    navigate(DOCS_CONNECT_PATH);
  }, [navigate, isAdminOrOwner]);

  return (
    <div data-tour-id="dashboard-integrations">
      <CollapsibleCard
        title={t("Common:AlreadyUsingAnotherPlatform")}
        description={
          <Trans
            t={t}
            ns="Common"
            i18nKey="IntegrationsDescription"
            values={{
              docsName: getBrandName("ProductEditorsName"),
              productName: getBrandName("ProductName"),
            }}
            components={{ strong: <strong key="strong" /> }}
          />
        }
        defaultOpen
      >
        <div className={styles.integrationsGrid}>
          {platforms.map((platform) => (
            <PlatformTile
              key={platform.id}
              name={platform.name}
              iconUrl={platform.iconUrl}
              iconAlt={platform.name}
              onClick={() => setOpenPlatform(platform)}
              testId={`dashboard-integration-${platform.id}`}
            />
          ))}
          <PlatformTile
            hideIcon
            isBold
            name={t("Common:PlusMore", { count: MORE_CONNECTORS_COUNT })}
            linkLabel={t("Common:ViewAll")}
            href={allConnectorsUrl}
            testId="dashboard-integration-more"
          />
        </div>
      </CollapsibleCard>

      <IntegrationDialog
        platform={openPlatform}
        onClose={closeDialog}
        onCreateInstance={onCreateInstance}
        isCreateInstanceDisabled={!isAdminOrOwner}
      />
    </div>
  );
};

export const IntegrationsCard = inject<TStore>(
  ({ settingsStore, userStore }) => ({
    // Room admins are excluded: only admins and the owner may open the
    // developer tools section Docs Connect lives in. Same flags the page
    // subtitle link, the Header and ProfileCard gate on.
    isAdminOrOwner:
      (userStore.user?.isAdmin ?? false) || (userStore.user?.isOwner ?? false),
    nextcloudUrl: settingsStore.nextcloudUrl,
    owncloudUrl: settingsStore.owncloudUrl,
    confluenceUrl: settingsStore.confluenceUrl,
    alfrescoUrl: settingsStore.alfrescoUrl,
    moodleUrl: settingsStore.moodleUrl,
    allConnectorsUrl: settingsStore.allConnectorsUrl,
    // Same API-reference target the Docs Connect promo page opens from its
    // "Read API documentation" action.
    docsApiUrl: settingsStore.docsConnectUrl,
  }),
)(observer(IntegrationsCardComponent));

export default IntegrationsCard;

