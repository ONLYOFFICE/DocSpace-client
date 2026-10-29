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

import { useTranslation } from "react-i18next";

import { ContextMenuButton } from "@onlyoffice/apps-ui-kit/components/context-menu-button";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import type { TByokKey } from "@docspace/shared/api/ai/types";

import AccessEditIconUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import TrashIconUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";

import { getByokProviderMeta } from "./providers";
import styles from "./Byok.module.scss";

type ByokKeyCardProps = {
  byokKey: TByokKey;
  providerName: string;
  onReplace: (byokKey: TByokKey) => void;
  onDelete: (byokKey: TByokKey) => Promise<void>;
};

const ByokKeyCard = ({
  byokKey,
  providerName,
  onReplace,
  onDelete,
}: ByokKeyCardProps) => {
  const { t } = useTranslation(["Common"]);

  const icon = getByokProviderMeta(byokKey.provider)?.icon;

  const onDeleteClick = async () => {
    try {
      await onDelete(byokKey);
    } catch (e) {
      toastr.error(e as Error);
    }
  };

  const getOptions = () => [
    ...(byokKey.name
      ? [
          {
            key: "replace-key",
            label: t("Common:ReplaceKey"),
            icon: AccessEditIconUrl,
            onClick: () => onReplace(byokKey),
          },
        ]
      : []),
    {
      key: "delete-key",
      label: t("Common:Delete"),
      icon: TrashIconUrl,
      onClick: onDeleteClick,
    },
  ];

  return (
    <div className={styles.card} data-testid="byok-key-card">
      <div className={styles.cardIcon}>
        {icon ? <img src={icon} alt="" /> : null}
      </div>
      <div className={styles.cardInfo}>
        <Text fontSize="14px" fontWeight={600} truncate>
          {byokKey.name ?? byokKey.id}
        </Text>
        <Text className={styles.cardProvider} fontSize="12px" truncate>
          {providerName}
        </Text>
      </div>
      <ContextMenuButton
        directionX="right"
        directionY="both"
        getData={getOptions}
        testId="byok-key-menu"
      />
    </div>
  );
};

export default ByokKeyCard;
