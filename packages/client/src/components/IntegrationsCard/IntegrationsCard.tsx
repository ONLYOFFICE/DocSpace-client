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
import {
  isDevToolsOffered,
  canManageDocsConnect,
} from "@docspace/shared/utils/devToolsAccess";

import ArrowIcon from "PUBLIC_DIR/images/arrow2.react.svg";
import PluginIcon from "PUBLIC_DIR/images/icons/20/catalog.devtools-plugin-sdk.react.svg";

import { MORE_CONNECTORS_COUNT } from "SRC_DIR/pages/PortalSettings/categories/developer-tools/DocsConnect/constants";

import { IntegrationDialog } from "./IntegrationDialog";
import {
  useIntegrationPlatforms,
  type IntegrationPlatform,
} from "./integrations-catalog";
import styles from "./IntegrationsCard.module.scss";

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
  /** Wrapper class, for pages that need their own spacing around the card. */
  className?: string;
  /** Anchors the Overview tour step; left out where no tour points at it. */
  dataTourId?: string;
  /**
   * Drops the instance button from the dialogs — set by the Docs Connect page,
   * where that button would only point back at the page you are already on.
   */
  hideInstanceAction?: boolean;
  /** Standalone portals have no Docs Connect; the card is not rendered there. */
  isStandalone?: boolean;
  /**
   * Whether the portal offers Developer Tools, where Docs Connect lives, to
   * this reader at all — it stops offering it to room admins and users once the
   * section is limited to admins. Not the same as having the rights to use it:
   * the card is informational, and the action inside its dialogs is refused
   * separately (`isAdminOrOwner`).
   */
  showIntegrations?: boolean;
  isAdminOrOwner?: boolean;
  nextcloudUrl?: string;
  owncloudUrl?: string;
  confluenceUrl?: string;
  alfrescoUrl?: string;
  moodleUrl?: string;
  allConnectorsUrl?: string;
  docsApiUrl?: string;
  /** `null` while unknown — see `DocsConnectStore.hasInstance`. */
  hasInstance?: boolean | null;
  checkInstance?: () => Promise<boolean>;
}

const IntegrationsCardComponent = (props: IntegrationsCardProps) => {
  const {
    className,
    dataTourId,
    hideInstanceAction = false,
    isStandalone = false,
    showIntegrations = true,
    allConnectorsUrl,
    isAdminOrOwner = false,
    hasInstance,
    checkInstance,
  } = props;
  const { t } = useTranslation(["Common", "DocsConnect"]);
  const navigate = useNavigate();

  const platforms = useIntegrationPlatforms(t, props);

  const [openPlatform, setOpenPlatform] =
    React.useState<IntegrationPlatform | null>(null);

  const closeDialog = React.useCallback(() => setOpenPlatform(null), []);

  // Every dialog opens with "create an instance" as step 1, so the card has to
  // know whether that step is already behind the reader. Asked once, and never
  // for anyone below a portal admin: room admins, users and guests cannot reach
  // Docs Connect, so the request would be answered with 403 and the step reads
  // the same either way.
  React.useEffect(() => {
    if (!isAdminOrOwner || hasInstance != null) return;
    checkInstance?.();
  }, [isAdminOrOwner, hasInstance, checkInstance]);

  // Docs Connect lives under the portal's developer tools, which only admins
  // and the owner can open — everyone else would land on /error/403. Same gate
  // the "or connect Docs" subtitle link uses.
  const onInstanceAction = React.useCallback(() => {
    if (!isAdminOrOwner) return;
    setOpenPlatform(null);
    navigate(DOCS_CONNECT_PATH);
  }, [navigate, isAdminOrOwner]);

  // Every one of these dialogs starts by creating a Docs Connect instance, and
  // the service is sold and hosted by us — a standalone portal has nothing to
  // connect to, so the card is left out entirely rather than advertising
  // something that cannot be had. Same for a reader who cannot open Developer
  // Tools, where Docs Connect lives. Below the hooks, so this component keeps
  // calling the same ones on every render.
  if (isStandalone || !showIntegrations) return null;

  return (
    <div className={className} data-tour-id={dataTourId}>
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
        onInstanceAction={onInstanceAction}
        isInstanceActionDisabled={!isAdminOrOwner}
        hasInstance={hasInstance ?? false}
        hideInstanceAction={hideInstanceAction}
      />
    </div>
  );
};

export const IntegrationsCard = inject<TStore>(
  ({ settingsStore, userStore, docsConnectStore }) => ({
    // Portal admins and the owner only — room admins, users and guests would
    // answer 403 on the Docs Connect page. The same rule the route guard and
    // the sidebar item ask, so nothing here offers a link that cannot open or
    // asks the server about an instance the reader may not see.
    isAdminOrOwner: canManageDocsConnect(
      userStore.user,
      settingsStore.standalone,
    ),
    isStandalone: settingsStore.standalone,
    // The same gate the dashboard's Developer Tools card uses, so the two cards
    // agree on who is offered the section: everyone, until the portal limits it
    // to admins. Lacking the rights to configure an instance does not take the
    // card away - it only refuses the action inside its dialogs.
    showIntegrations: isDevToolsOffered(
      userStore.user,
      settingsStore.limitedAccessDevToolsForUsers,
    ),
    nextcloudUrl: settingsStore.nextcloudUrl,
    owncloudUrl: settingsStore.owncloudUrl,
    confluenceUrl: settingsStore.confluenceUrl,
    alfrescoUrl: settingsStore.alfrescoUrl,
    moodleUrl: settingsStore.moodleUrl,
    allConnectorsUrl: settingsStore.allConnectorsUrl,
    // Same API-reference target the Docs Connect promo page opens from its
    // "Read API documentation" action.
    docsApiUrl: settingsStore.docsConnectUrl,
    // Null until answered; the dialogs treat that as "not created yet" and the
    // card asks on mount.
    hasInstance: docsConnectStore.hasInstance,
    checkInstance: docsConnectStore.checkInstance,
  }),
)(observer(IntegrationsCardComponent));

export default IntegrationsCard;

