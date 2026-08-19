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

import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";
import SocketHelper, {
  SocketCommands,
  SocketEvents,
} from "@docspace/ui-kit/utils/socket";

import ConnectAccountDialog from "SRC_DIR/components/dialogs/ConnectAccountDialog";
import DisconnectAccountDialog from "SRC_DIR/components/dialogs/DisconnectAccountDialog";

import TargetUserStore from "SRC_DIR/store/contacts/TargetUserStore";

import Channel from "./sub-components/Channel";

import styles from "./Notifications.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

type NotificationsChannelsProps = {
  connectAccountDialogVisible?: TStore["dialogsStore"]["connectAccountDialogVisible"];
  disconnectAccountDialogVisible?: TStore["dialogsStore"]["disconnectAccountDialogVisible"];
  setConnectAccountDialogVisible?: TStore["dialogsStore"]["setConnectAccountDialogVisible"];
  setDisconnectAccountDialogVisible?: TStore["dialogsStore"]["setDisconnectAccountDialogVisible"];
  user?: TStore["userStore"]["user"];
  isConnected?: TStore["telegramStore"]["isConnected"];
  username?: TStore["telegramStore"]["username"];
  isEmailEnabled?: TargetUserStore["isEmailEnabled"];
  isTelegramEnabled?: TargetUserStore["isTelegramEnabled"];
  isEmailNotValid?: TargetUserStore["isEmailNotValid"];
  checkTg?: TStore["telegramStore"]["checkTg"];
  checkNotificationsChannels?: TargetUserStore["checkNotificationsChannels"];
};

const NotificationsChannels = ({
  connectAccountDialogVisible,
  disconnectAccountDialogVisible,
  setConnectAccountDialogVisible,
  setDisconnectAccountDialogVisible,
  user,
  isConnected,
  username,
  isEmailEnabled,
  isTelegramEnabled,
  isEmailNotValid,
  checkTg,
  checkNotificationsChannels,
}: NotificationsChannelsProps) => {
  const { t } = useTranslation(["Profile", "Notifications", "Common"]);

  useEffect(() => {
    SocketHelper?.emit(SocketCommands.Subscribe, {
      roomParts: "telegram",
      individual: true,
    });

    const updateTelegramHandler = (data: string) => {
      if (typeof data === "string") {
        checkTg?.();
        toastr.success(
          t("Notifications:SuccessConnected", {
            serviceName: getBrandName("ProviderTelegram"),
          }),
        );
      }
    };

    const connectTelegramHandler = () => {
      checkNotificationsChannels?.();
    };

    SocketHelper?.on(SocketEvents.UpdateTelegram, updateTelegramHandler);
    SocketHelper?.on(SocketEvents.ConnectTelegram, connectTelegramHandler);

    return () => {
      SocketHelper?.off(SocketEvents.UpdateTelegram, updateTelegramHandler);
      SocketHelper?.off(SocketEvents.ConnectTelegram, connectTelegramHandler);
    };
  }, []);

  return (
    <div className={styles.notificationsChannels}>
      <div className={styles.header}>
        <Text fontSize="14px" fontWeight={600}>
          {t("NotificationsChannels")}
        </Text>
      </div>
      <div className={styles.channels}>
        {isEmailEnabled ? (
          <Channel
            type="email"
            name={user?.email || ""}
            isConnected
            isNotValid={isEmailNotValid}
          />
        ) : null}
        <Channel
          type="telegram"
          name={username ? `@${username}` : ""}
          onConnect={() => setConnectAccountDialogVisible?.(true)}
          onDisconnect={() => setDisconnectAccountDialogVisible?.(true)}
          isConnected={isTelegramEnabled ? isConnected : false}
          isAdmin={user?.isAdmin || user?.isOwner}
          isNeedConfig={!isTelegramEnabled}
        />
      </div>
      {connectAccountDialogVisible ? (
        <ConnectAccountDialog key="connect-account-dialog" />
      ) : null}
      {disconnectAccountDialogVisible ? (
        <DisconnectAccountDialog key="disconnect-account-dialog" />
      ) : null}
    </div>
  );
};

export default inject(
  ({
    dialogsStore,
    userStore,
    telegramStore,
    peopleStore,
    currentQuotaStore,
  }: TStore) => {
    const {
      connectAccountDialogVisible,
      disconnectAccountDialogVisible,
      setConnectAccountDialogVisible,
      setDisconnectAccountDialogVisible,
    } = dialogsStore;
    const { user } = userStore;
    const { isConnected, username, checkTg } = telegramStore;

    const {
      isEmailEnabled,
      isTelegramEnabled,
      isEmailNotValid,
      checkNotificationsChannels,
    } = peopleStore.targetUserStore!;

    return {
      connectAccountDialogVisible,
      disconnectAccountDialogVisible,
      setConnectAccountDialogVisible,
      setDisconnectAccountDialogVisible,
      user,
      isConnected,
      username,
      isEmailEnabled,
      isTelegramEnabled,
      isEmailNotValid,
      checkTg,
      checkNotificationsChannels,
    };
  },
)(observer(NotificationsChannels));
