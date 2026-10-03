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

import DragReactSvg from "PUBLIC_DIR/images/menu.react.svg";

import type { HTMLAttributes } from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import type { ContextMenuModel } from "@onlyoffice/apps-ui-kit/components/context-menu";
import { ContextMenuButton } from "@onlyoffice/apps-ui-kit/components/context-menu-button";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";

import type { TFieldDraft } from "../../types";
import { getFieldTypeLabel } from "../../utils";
import styles from "./TemplatePanel.module.scss";

type FieldRowProps = {
  field: TFieldDraft;
  isFirst: boolean;
  isLast: boolean;
  isDragging: boolean;
  dragProps: HTMLAttributes<HTMLDivElement>;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
};

const FieldRow = ({
  field,
  isFirst,
  isLast,
  isDragging,
  dragProps,
  onEdit,
  onMoveUp,
  onMoveDown,
  onRemove,
}: FieldRowProps) => {
  const { t } = useTranslation(["Metadata", "Common"]);

  const getContextOptions = (): ContextMenuModel[] => [
    { key: "edit", label: t("Common:EditButton"), onClick: onEdit },
    {
      key: "move-up",
      label: t("Metadata:MoveUp"),
      disabled: isFirst,
      onClick: onMoveUp,
    },
    {
      key: "move-down",
      label: t("Metadata:MoveDown"),
      disabled: isLast,
      onClick: onMoveDown,
    },
    { key: "separator", isSeparator: true },
    { key: "delete", label: t("Common:Delete"), onClick: onRemove },
  ];

  return (
    <div
      className={classNames(styles.fieldRow, {
        [styles.dragging]: isDragging,
      })}
      {...dragProps}
    >
      <DragReactSvg className={styles.dragHandle} />
      <div className={styles.fieldInfo}>
        <Text fontWeight={600} truncate>
          {field.name}
        </Text>
        <Text className={styles.hint} fontSize="12px">
          {getFieldTypeLabel(t, field.type)}
        </Text>
      </div>
      <ContextMenuButton
        directionX="right"
        directionY="both"
        getData={getContextOptions}
      />
    </div>
  );
};

export default FieldRow;
