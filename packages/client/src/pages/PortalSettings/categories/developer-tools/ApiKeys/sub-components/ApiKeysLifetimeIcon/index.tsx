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

import classNames from "classnames";
import LifetimeReactSvgUrl from "PUBLIC_DIR/images/lifetime.react.svg?url";
import { IconSizeType } from "@docspace/shared/utils";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import { Text } from "@docspace/ui-kit/components/text";
import { TTranslation } from "@docspace/shared/types";
import { TApiKey } from "@docspace/shared/api/api-keys/types";
import { now, parseToDateTime, isAfter } from "@docspace/ui-kit/utils/date";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import styles from "./ApiKeysLifetimeIcon.module.scss";

export const ApiKeysLifetimeIcon = ({
  t,
  item,
  expiresAt,
  expiresAtDate,
}: {
  t: TTranslation;
  item: TApiKey;
  expiresAt: string;
  expiresAtDate: string;
}) => {
  const showLifetimeIcon = expiresAt;
  const isExpired = isAfter(now(), parseToDateTime(expiresAt));

  const getTooltipContent = () => (
    <Text fontSize="12px" fontWeight={400} noSelect>
      {isExpired
        ? t("Settings:APIKeyExpired")
        : t("Settings:APIKeyDeactivated", { date: expiresAtDate })}
    </Text>
  );

  return showLifetimeIcon ? (
    <div
      className={classNames(styles.lifetimeIcon, {
        [styles.notExpired]: !isExpired,
      })}
    >
      <IconButton
        iconName={LifetimeReactSvgUrl}
        className="api-keys_lifetime"
        size={IconSizeType.medium}
        isClickable
        data-tooltip-id={`lifetimeTooltip${item.id}`}
        isFill={false}
      />
      <Tooltip
        id={`lifetimeTooltip${item.id}`}
        place="bottom"
        getContent={getTooltipContent}
        maxWidth="300px"
      />
    </div>
  ) : null;
};
