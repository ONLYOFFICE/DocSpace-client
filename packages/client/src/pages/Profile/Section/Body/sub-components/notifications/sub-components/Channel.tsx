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

import CloseIcon from "PUBLIC_DIR/images/cross.edit.react.svg?url";
import EmailIcon from "PUBLIC_DIR/images/@.react.svg?url";
import TelegramIcon from "PUBLIC_DIR/images/telegram.react.svg?url";

import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import classNames from "classnames";

import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkType, LinkTarget } from "@docspace/ui-kit/components/link";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { THIRD_PARTY_SERVICES_URL } from "@docspace/shared/constants";

import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import styles from "../Notifications.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

type ChannelProps = {
  type: "email" | "telegram";
  name: string;
  isConnected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  isNeedConfig?: boolean;
  isAdmin?: boolean;
  isNotValid?: boolean;
};

const getIcon = (type: ChannelProps["type"]) => {
  switch (type) {
    case "email":
      return EmailIcon;
    case "telegram":
      return TelegramIcon;
    default:
      return EmailIcon;
  }
};

const getTypeTitle = (
  t: TFunction,
  type: ChannelProps["type"],
  isNotValid?: boolean,
  isNeedConfig?: boolean,
) => {
  switch (type) {
    case "email":
      return `${t("Common:Email")}${isNotValid ? ` (${t("IsNotValid")})` : ""}`;
    case "telegram":
      return `${getBrandName("ProviderTelegram")}${isNeedConfig ? ` (${t("NotConfigured")})` : ""}`;
    default:
      return t("Common:Email");
  }
};

const getChannelContent = (
  t: TFunction,
  {
    type,
    name,
    isConnected,
    isNeedConfig,
    isAdmin,
    isNotValid,
    onConnect,
  }: Pick<
    ChannelProps,
    | "type"
    | "name"
    | "isConnected"
    | "isNeedConfig"
    | "isAdmin"
    | "isNotValid"
    | "onConnect"
  >,
) => {
  if (isConnected) {
    return (
      <Text
        fontWeight={600}
        fontSize="13px"
        className={classNames({
          [styles.isNotValid]: isNotValid,
        })}
      >
        {name}
      </Text>
    );
  }

  if (isNeedConfig) {
    if (!isAdmin)
      return (
        <Text fontWeight={600} fontSize="12px" className={styles.disabledText}>
          {t("AdminSetupRequired")}
        </Text>
      );

    return (
      <Link
        fontSize="13px"
        fontWeight={600}
        isHovered
        type={LinkType.action}
        href={`${THIRD_PARTY_SERVICES_URL}${type}`}
        target={LinkTarget.blank}
      >
        {t("Common:GoToSettings")}
      </Link>
    );
  }

  return (
    <Link
      dataTestId="profile-telegram-connect"
      fontSize="13px"
      fontWeight={600}
      isHovered
      type={LinkType.action}
      onClick={onConnect}
    >
      {t("Common:Connect")}
    </Link>
  );
};

const Channel = ({
  type,
  name,
  isConnected,
  onConnect,
  onDisconnect,
  isNeedConfig,
  isAdmin,
  isNotValid,
}: ChannelProps) => {
  const { t } = useTranslation(["Notifications", "Common"]);

  return (
    <div
      className={classNames(styles.channelWrapper, {
        [styles.isConnected]: isConnected,
      })}
    >
      <ReactSVG
        src={getIcon(type)}
        className={type === "email" ? styles.emailIcon : ""}
      />
      <div className={styles.channelContent}>
        <Text className={styles.channelType} fontWeight={600} fontSize="12px">
          {getTypeTitle(t, type, isNotValid, isNeedConfig)}
        </Text>
        {getChannelContent(t, {
          type,
          name,
          isConnected,
          isNeedConfig,
          isAdmin,
          isNotValid,
          onConnect,
        })}
      </div>
      {isConnected && onDisconnect ? (
        <ReactSVG
          src={CloseIcon}
          className={styles.closeIcon}
          onClick={onDisconnect}
        />
      ) : null}

      {isNotValid ? (
        <div className={styles.helpButton}>
          <HelpButton
            size={16}
            place="right"
            tooltipContent={
              <Text fontSize="12px" fontWeight={400}>
                {t("LdapEmailTooltip")}
              </Text>
            }
          />
        </div>
      ) : null}
    </div>
  );
};

export default Channel;
