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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { Text } from "@docspace/shared/components/text";

import TargetUserStore from "SRC_DIR/store/contacts/TargetUserStore";

import Channel from "./sub-components/Channel";

import styles from "./Notifications.module.scss";

type NotificationsChannelsProps = {
  setConnectAccountDialogVisible?: TStore["dialogsStore"]["setConnectAccountDialogVisible"];
  setDisconnectAccountDialogVisible?: TStore["dialogsStore"]["setDisconnectAccountDialogVisible"];
  user?: TStore["userStore"]["user"];
  isConnected?: TStore["telegramStore"]["isConnected"];
  username?: TStore["telegramStore"]["username"];
  isEmailEnabled?: TargetUserStore["isEmailEnabled"];
  isTelegramEnabled?: TargetUserStore["isTelegramEnabled"];
  isEmailNotValid?: TargetUserStore["isEmailNotValid"];
};

const NotificationsChannels = ({
  setConnectAccountDialogVisible,
  setDisconnectAccountDialogVisible,
  user,
  isConnected,
  username,
  isEmailEnabled,
  isTelegramEnabled,
  isEmailNotValid,
}: NotificationsChannelsProps) => {
  const { t } = useTranslation("Profile");

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
          name={`@${username}` || ""}
          onConnect={() => setConnectAccountDialogVisible?.(true)}
          onDisconnect={() => setDisconnectAccountDialogVisible?.(true)}
          isConnected={isConnected}
          isAdmin={user?.isAdmin}
          isNeedConfig={!isTelegramEnabled}
        />
      </div>
    </div>
  );
};

export default inject(
  ({ dialogsStore, userStore, telegramStore, peopleStore }: TStore) => {
    const {
      setConnectAccountDialogVisible,
      setDisconnectAccountDialogVisible,
    } = dialogsStore;
    const { user } = userStore;
    const { isConnected, username } = telegramStore;

    const { isEmailEnabled, isTelegramEnabled, isEmailNotValid } =
      peopleStore.targetUserStore!;

    return {
      setConnectAccountDialogVisible,
      setDisconnectAccountDialogVisible,
      user,
      isConnected,
      username,
      isEmailEnabled,
      isTelegramEnabled,
      isEmailNotValid,
    };
  },
)(observer(NotificationsChannels));
