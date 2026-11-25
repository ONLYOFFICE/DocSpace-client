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

import { useId } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { useEncryption } from "@docspace/shared/context/encryption";

import styles from "./PrivateRoomLockedBlock.module.scss";

type PrivateRoomReplacedKeyNoticeProps = {
  /** The open folder is a private room or lies inside one. */
  isPrivate: boolean;
  /** Loaded files wrapped for a key the user no longer holds. */
  count: number;
};

// Spec: private-rooms/file-operations, "A private room names the files wrapped for a key the user no longer holds"
const PrivateRoomReplacedKeyNotice = ({
  isPrivate,
  count,
}: PrivateRoomReplacedKeyNoticeProps) => {
  const { t } = useTranslation(["Common"]);
  const titleId = useId();
  const { isUnlocked } = useEncryption();

  if (!isPrivate || !isUnlocked || count === 0) return null;

  return (
    <section
      className={styles.block}
      aria-labelledby={titleId}
      data-testid="private_room_replaced_key_notice"
    >
      <div className={styles.body}>
        <Text as="h2" id={titleId} fontSize="16px" fontWeight={700}>
          {t("Common:PrivateRoomReplacedKeyBarTitle")}
        </Text>
        <Text fontSize="13px" className={styles.text}>
          {count === 1
            ? t("Common:PrivateRoomReplacedKeyBarText_one", { count })
            : t("Common:PrivateRoomReplacedKeyBarText_other", { count })}
        </Text>
      </div>
    </section>
  );
};

export default inject(({ filesStore, treeFoldersStore }: TStore) => ({
  // A folder inside a private room is not private itself; its room is.
  isPrivate: !!treeFoldersStore.isPrivacyFolder,
  count: filesStore.replacedKeyFilesCount,
}))(observer(PrivateRoomReplacedKeyNotice));
