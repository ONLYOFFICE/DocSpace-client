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

import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";

import { useTranslation } from "react-i18next";

import { FieldContainer } from "@onlyoffice/apps-ui-kit/components/field-container";
import { IconButton } from "@onlyoffice/apps-ui-kit/components/icon-button";
import {
  InputType,
  TextInput,
} from "@onlyoffice/apps-ui-kit/components/text-input";
import {
  METADATA_NAME_MAX_LENGTH,
  METADATA_VALUE_MAX_LENGTH,
} from "@docspace/shared/utils/metadata";

import type { TCustomFieldDraft } from "../../types";
import styles from "../Panel.module.scss";

type CustomFieldRowProps = {
  draft: TCustomFieldDraft;
  isNameTaken: boolean;
  onChange: (draft: TCustomFieldDraft) => void;
  onRemove: () => void;
};

const CustomFieldRow = ({
  draft,
  isNameTaken,
  onChange,
  onRemove,
}: CustomFieldRowProps) => {
  const { t } = useTranslation(["Metadata", "Common"]);

  const valueInput = (
    <TextInput
      type={InputType.text}
      value={draft.value}
      onChange={(e) => onChange({ ...draft, value: e.target.value })}
      placeholder={t("Metadata:EnterValue")}
      maxLength={METADATA_VALUE_MAX_LENGTH}
      scale
      testId="metadata_custom_field_value_input"
    />
  );

  const removeButton = (
    <IconButton
      iconName={CatalogTrashReactSvgUrl}
      size={16}
      isClickable
      title={t("Common:Delete")}
      onClick={onRemove}
      dataTestId="metadata_custom_field_remove_button"
    />
  );

  if (!draft.isNew) {
    return (
      <FieldContainer
        labelVisible
        isVertical
        removeMargin
        labelText={draft.name}
      >
        <div className={styles.inputRow}>
          {valueInput}
          {removeButton}
        </div>
      </FieldContainer>
    );
  }

  return (
    <div className={styles.newField}>
      <FieldContainer
        labelVisible
        isVertical
        removeMargin
        labelText={t("Metadata:CustomFieldName")}
        hasError={isNameTaken}
        errorMessage={t("Metadata:FieldNameExists")}
      >
        <div className={styles.inputRow}>
          <TextInput
            type={InputType.text}
            value={draft.name}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
            placeholder={t("Metadata:EnterFieldName")}
            maxLength={METADATA_NAME_MAX_LENGTH}
            hasError={isNameTaken}
            scale
            isAutoFocussed
            testId="metadata_custom_field_name_input"
          />
          {removeButton}
        </div>
      </FieldContainer>
      <FieldContainer
        labelVisible
        isVertical
        removeMargin
        labelText={t("Metadata:CustomFieldValue")}
      >
        <div className={styles.inputRow}>
          {valueInput}
          <span className={styles.removeSpacer} />
        </div>
      </FieldContainer>
    </div>
  );
};

export default CustomFieldRow;
