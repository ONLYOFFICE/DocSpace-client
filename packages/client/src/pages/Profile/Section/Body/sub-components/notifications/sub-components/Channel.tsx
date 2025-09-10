// (c) Copyright Ascensio System SIA 2009-2025
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

import CloseIcon from "PUBLIC_DIR/images/cross.edit.react.svg?url";
import EmailIcon from "PUBLIC_DIR/images/@.react.svg?url";
import TelegramIcon from "PUBLIC_DIR/images/telegram.react.svg?url";

import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import classNames from "classnames";

import { Text } from "@docspace/shared/components/text";
import { Link, LinkType, LinkTarget } from "@docspace/shared/components/link";
import { HelpButton } from "@docspace/shared/components/help-button";
import { Badge } from "@docspace/shared/components/badge";
import { THIRD_PARTY_SERVICES_URL } from "@docspace/shared/constants";

import { globalColors } from "@docspace/shared/themes";
import { useTheme } from "@docspace/shared/hooks/useTheme";

import styles from "../Notifications.module.scss";

type ChannelProps = {
  type: "email" | "telegram";
  name: string;
  isConnected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  isNeedConfig?: boolean;
  isAdmin?: boolean;
  isNotValid?: boolean;
  isThirdPartyAvailable?: boolean;
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
      return `${t("Common:ProviderTelegram")}${isNeedConfig ? ` (${t("NotConfigured")})` : ""}`;
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
        {t("GoToSettings")}
      </Link>
    );
  }

  return (
    <Link
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
  isThirdPartyAvailable,
}: ChannelProps) => {
  const { t } = useTranslation(["Notifications", "Common"]);
  const { isBase } = useTheme();

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

      {!isThirdPartyAvailable && isNeedConfig ? (
        <Badge
          className={styles.paidBadge}
          fontWeight="700"
          label={t("Common:Paid")}
          backgroundColor={
            isBase
              ? globalColors.favoritesStatus
              : globalColors.favoriteStatusDark
          }
          isPaidBadge
        />
      ) : null}
    </div>
  );
};

export default Channel;
