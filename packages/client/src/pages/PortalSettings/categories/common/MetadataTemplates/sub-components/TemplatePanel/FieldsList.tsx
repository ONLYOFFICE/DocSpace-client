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

import PlusReactSvgUrl from "PUBLIC_DIR/images/icons/16/button.plus.react.svg?url";

import { useTranslation } from "react-i18next";

import { AddButton } from "@onlyoffice/apps-ui-kit/components/add-button";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";

import { useDragReorder } from "../../hooks/useDragReorder";
import type { TFieldDraft } from "../../types";
import FieldRow from "./FieldRow";
import styles from "./TemplatePanel.module.scss";

export type FieldsListProps = {
  fields: TFieldDraft[];
  onAddField: () => void;
  onEditField: (field: TFieldDraft) => void;
  onMoveField: (from: number, to: number) => void;
  onRemoveField: (key: string) => void;
};

const FieldsList = ({
  fields,
  onAddField,
  onEditField,
  onMoveField,
  onRemoveField,
}: FieldsListProps) => {
  const { t } = useTranslation(["Metadata"]);
  const { dragIndex, getDragProps } = useDragReorder(onMoveField);

  return (
    <div className={styles.list}>
      <Text fontSize="16px" fontWeight={700}>
        {t("Metadata:Fields")}
      </Text>
      <Text className={styles.hint} fontSize="12px">
        {t("Metadata:FieldsDescription")}
      </Text>
      <AddButton
        iconName={PlusReactSvgUrl}
        label={t("Metadata:AddField")}
        onClick={onAddField}
        testId="metadata_add_field_button"
      />
      {fields.map((field, index) => (
        <FieldRow
          key={field.key}
          field={field}
          isFirst={index === 0}
          isLast={index === fields.length - 1}
          isDragging={dragIndex === index}
          dragProps={getDragProps(index)}
          onEdit={() => onEditField(field)}
          onMoveUp={() => onMoveField(index, index - 1)}
          onMoveDown={() => onMoveField(index, index + 1)}
          onRemove={() => onRemoveField(field.key)}
        />
      ))}
    </div>
  );
};

export default FieldsList;
