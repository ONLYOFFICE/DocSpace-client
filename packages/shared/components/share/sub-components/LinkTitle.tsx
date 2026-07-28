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

import React, { FC } from "react";
import classNames from "classnames";

import CopyIcon from "PUBLIC_DIR/images/icons/12/copy.svg?url";
import EmptyIcon from "PUBLIC_DIR/images/empty.svg?url";

import { Text } from "@docspace/ui-kit/components/text";
import { IconButton } from "@docspace/ui-kit/components/icon-button";

import styles from "../Share.module.scss";
import type { LinkTitleProps } from "../Share.types";

const LinkTitle: FC<LinkTitleProps> = ({
  t,
  isLoaded,
  linkTitle,
  disabledCopy,
  isExpiredLink,
  shareLink,
  onCopyLink,
  isBlockedByAdmin,
}) => {
  return (
    <div>
      <div className={styles.linkTitleContainer} onClick={onCopyLink}>
        <Text
          className={classNames(
            styles.linkOptionsTitle,
            styles.linkOptionsTitleRoom,
            {
              [styles.isExpired]: isExpiredLink,
            },
          )}
          title={linkTitle}
          truncate
        >
          {linkTitle}
        </Text>
        {!disabledCopy ? (
          <div className={styles.linkActionsCopyIconContainer}>
            <img
              className={styles.linkActionsCopyImgIcon}
              src={EmptyIcon}
              alt={shareLink}
            />
            <IconButton
              title={t("Common:CopySharedLink")}
              className={styles.linkActionsCopyIcon}
              size={12}
              iconName={CopyIcon}
              isDisabled={isExpiredLink || isLoaded}
            />
          </div>
        ) : null}
      </div>
      {isBlockedByAdmin ? (
        <Text className={styles.blockedByAdmin}>
          {t("Common:BlockedByAdmin")}
        </Text>
      ) : null}
    </div>
  );
};

export default LinkTitle;
