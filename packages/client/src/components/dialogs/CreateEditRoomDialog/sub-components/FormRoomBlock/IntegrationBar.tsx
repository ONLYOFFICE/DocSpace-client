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
import PublicRoomBar from "@docspace/ui-kit/components/public-room-bar";
import { Link, LinkType } from "@docspace/ui-kit/components/link";

import DangerToastReactSvg from "@docspace/ui-kit/assets/danger.toast.react.svg";
import { useLocalStorage } from "@docspace/shared/hooks/useLocalStorage";

import styles from "./FormRoomBlock.module.scss";

type IntegrationBarProps = {
  t: (key: string) => string;
  hasDatabaseConnection?: boolean;
  isRoomAdmin?: boolean;
};

const STORAGE_KEY = "form_room_integrations_bar_dismissed";
const BASE_PATH = "/portal-settings/integration/third-party-services";

const IntegrationBar = ({
  t,
  isRoomAdmin = false,
  hasDatabaseConnection = false,
}: IntegrationBarProps) => {
  const [isDismissed, setIsDismissed] = useLocalStorage<boolean>(
    STORAGE_KEY,
    false,
  );

  if (hasDatabaseConnection && (isRoomAdmin || isDismissed)) return null;

  const headerText = hasDatabaseConnection
    ? t("NeedMoreIntegrations")
    : t("NoDatabaseConnections");

  const descriptionText =
    isRoomAdmin && !hasDatabaseConnection
      ? t("NoDatabaseConnectionsRoomAdmin")
      : hasDatabaseConnection
        ? t("NeedMoreIntegrationsDescription")
        : t("ConfigureDatabaseConnection");

  const handleClose = hasDatabaseConnection
    ? () => setIsDismissed(true)
    : undefined;

  const icon = hasDatabaseConnection ? <></> : <DangerToastReactSvg />;

  const link = hasDatabaseConnection
    ? BASE_PATH
    : `${BASE_PATH}?consumer=externaldb`;

  return (
    <PublicRoomBar
      iconName={icon}
      headerText={headerText}
      bodyText={
        <div className={styles.barBody}>
          <span className={styles.barDescription}>{descriptionText}</span>
          {!isRoomAdmin && (
            <Link
              color="accent"
              type={LinkType.page}
              className={styles.barLink}
              href={link}
              isHovered
            >
              {t("GoToIntegrations")}
            </Link>
          )}
        </div>
      }
      onClose={handleClose}
      barIsVisible
    />
  );
};

export default IntegrationBar;
