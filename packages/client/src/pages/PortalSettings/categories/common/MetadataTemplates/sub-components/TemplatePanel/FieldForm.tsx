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
import { useTranslation } from "react-i18next";

import {
  ComboBox,
  type TOption,
} from "@onlyoffice/apps-ui-kit/components/combobox";
import { FieldContainer } from "@onlyoffice/apps-ui-kit/components/field-container";
import {
  InputType,
  TextInput,
} from "@onlyoffice/apps-ui-kit/components/text-input";
import type { MetadataFieldType } from "@docspace/shared/enums";
import { METADATA_NAME_MAX_LENGTH } from "@docspace/shared/utils/metadata";

import { FIELD_TYPES } from "../../constants";
import type { TFieldForm } from "../../types";
import {
  addOption,
  getFieldTypeLabel,
  isChoiceType,
  removeOption,
  setFieldType,
  setOptionValue,
} from "../../utils";
import OptionsList from "./OptionsList";
import styles from "./TemplatePanel.module.scss";

type FieldFormProps = {
  value: TFieldForm;
  isNameTaken: boolean;
  onChange: (value: TFieldForm) => void;
};

const FieldForm = ({ value, isNameTaken, onChange }: FieldFormProps) => {
  const { t } = useTranslation(["Metadata", "Common"]);

  const typeOptions: TOption[] = FIELD_TYPES.map((type) => ({
    key: String(type),
    label: getFieldTypeLabel(t, type),
  }));

  const selectedType = typeOptions.find(
    (option) => option.key === String(value.type),
  ) ?? { key: "", label: t("Metadata:SelectType") };

  return (
    <div className={classNames(styles.form, styles.fieldForm)}>
      <FieldContainer
        labelVisible
        isVertical
        removeMargin
        labelText={t("Common:Name")}
        hasError={isNameTaken}
        errorMessage={t("Metadata:FieldNameExists")}
      >
        <TextInput
          type={InputType.text}
          value={value.name}
          hasError={isNameTaken}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder={t("Metadata:EnterFieldName")}
          maxLength={METADATA_NAME_MAX_LENGTH}
          scale
          isAutoFocussed
          testId="metadata_field_name_input"
        />
      </FieldContainer>

      <FieldContainer
        labelVisible
        isVertical
        removeMargin
        labelText={t("Common:Type")}
      >
        <ComboBox
          options={typeOptions}
          selectedOption={selectedType}
          onSelect={(option) =>
            onChange(
              setFieldType(value, Number(option.key) as MetadataFieldType),
            )
          }
          displaySelectedOption
          scaled
          scaledOptions
          dataTestId="metadata_field_type_combobox"
        />
      </FieldContainer>

      {isChoiceType(value.type) ? (
        <OptionsList
          options={value.options}
          onAdd={() => onChange(addOption(value))}
          onChange={(index, option) =>
            onChange(setOptionValue(value, index, option))
          }
          onRemove={(index) => onChange(removeOption(value, index))}
        />
      ) : null}
    </div>
  );
};

export default FieldForm;
