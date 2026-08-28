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
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { Text } from "@docspace/ui-kit/components/text";
import { isMobile } from "@docspace/ui-kit/utils/device";
import { getBrandName } from "@docspace/shared/constants/brands";
import type { TIntegrationsEntries } from "@docspace/shared/api/settings/types";

import { IntegrationDialog } from "SRC_DIR/components/IntegrationsCard/IntegrationDialog";
import {
  PlatformTile,
  PlatformTileGrid,
} from "SRC_DIR/components/IntegrationsCard/PlatformTile";
import type { IntegrationPlatform } from "SRC_DIR/components/IntegrationsCard/integrations-catalog";

import { useSdkConnectors } from "./sdk-connectors-catalog";

import styles from "./StyledPortalIntegration.module.scss";

type IntegrationProps = {
  className?: string;
  compact?: boolean;
  integrationsEntries?: TIntegrationsEntries;
  nextcloudUrl?: string;
  owncloudUrl?: string;
  confluenceUrl?: string;
  alfrescoUrl?: string;
  moodleUrl?: string;
  allConnectorsUrl?: string;
};

const Integration = ({ className, compact, ...urls }: IntegrationProps) => {
  const { t } = useTranslation(["JavascriptSdk", "Common"]);

  const connectors = useSdkConnectors(t, urls);

  const testIdPrefix = compact ? "sdk-connector-compact" : "sdk-connector";

  const [openConnector, setOpenConnector] =
    React.useState<IntegrationPlatform | null>(null);

  const closeDialog = React.useCallback(() => setOpenConnector(null), []);

  return (
    <div className={classNames(styles.connectors, className)}>
      <div
        className={classNames(
          styles.categoryHeader,
          { [styles.isMobile]: isMobile() },
          "integration-header",
        )}
      >
        {t("JavascriptSdk:ConnectorsTitle")}
      </div>
      <Text lineHeight="20px" className={styles.connectorsDescription}>
        {t("JavascriptSdk:ConnectorsDescription", {
          organizationName: getBrandName("OrganizationName"),
        })}
      </Text>

      <PlatformTileGrid compact={compact}>
        {connectors.map((connector) => (
          <PlatformTile
            key={connector.id}
            name={connector.name}
            iconUrl={connector.iconUrl}
            iconAlt={connector.name}
            onClick={() => setOpenConnector(connector)}
            testId={`${testIdPrefix}-${connector.id}`}
          />
        ))}
        <PlatformTile
          hideIcon
          wide={compact}
          isBold
          name={t("JavascriptSdk:SeeAllConnectors")}
          href={urls.allConnectorsUrl}
          testId={`${testIdPrefix}-all`}
        />
      </PlatformTileGrid>

      <IntegrationDialog
        platform={openConnector}
        onClose={closeDialog}
        hideInstanceAction
      />
    </div>
  );
};

export default inject<TStore>(({ settingsStore }) => {
  const {
    integrationsEntries,
    nextcloudUrl,
    owncloudUrl,
    confluenceUrl,
    alfrescoUrl,
    moodleUrl,
    allConnectorsUrl,
  } = settingsStore;

  return {
    integrationsEntries,
    nextcloudUrl,
    owncloudUrl,
    confluenceUrl,
    alfrescoUrl,
    moodleUrl,
    allConnectorsUrl,
  };
})(observer(Integration));
