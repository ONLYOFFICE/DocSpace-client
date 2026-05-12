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
