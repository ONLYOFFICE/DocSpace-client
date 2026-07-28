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

import React from "react";
import { match } from "ts-pattern";

import { ComboBox } from "@docspace/ui-kit/components/combobox";
import { InputType, TextInput } from "@docspace/ui-kit/components/text-input";
import { PasswordInput } from "@docspace/ui-kit/components/password-input";
import { Text } from "@docspace/ui-kit/components/text";
import { Checkbox } from "@docspace/ui-kit/components";

import styles from "./ExternalDbModal.module.scss";
import type { ExternalDbFieldProps } from "./ExternalDbModal.types";

const ExternalDbField: React.FC<ExternalDbFieldProps> = ({
  field,
  value,
  onChange,
}) => {
  const fieldName = field.name;

  return match(field)
    .with({ type: "select" }, (selectField) => (
      <div className={styles.fieldGroup}>
        <Text className={styles.fieldLabel}>{selectField.title}</Text>
        <ComboBox
          options={selectField.options.map((opt) => ({
            key: opt,
            label: opt,
          }))}
          selectedOption={{
            key: String(value),
            label: String(value),
          }}
          onSelect={(option) => onChange(fieldName, String(option.key))}
          scaled
          tabIndex={0}
        />
      </div>
    ))
    .with({ type: "password" }, (passwordField) => (
      <div className={styles.fieldGroup}>
        <Text as="label" htmlFor={fieldName} className={styles.fieldLabel}>
          {passwordField.title}
        </Text>
        <PasswordInput
          simpleView
          id={fieldName}
          inputName={fieldName}
          inputValue={String(value)}
          onChange={(e) => onChange(fieldName, e.target.value)}
          placeholder={passwordField.title}
          scale
          tabIndex={0}
        />
      </div>
    ))
    .with({ type: "toggle" }, (toggleField) => {
      return (
        <div className={styles.toggleField}>
          <Checkbox
            isChecked={Boolean(value)}
            onChange={(e) => onChange(fieldName, e.target.checked)}
            label={toggleField.title}
            tabIndex={0}
          />
        </div>
      );
    })
    .with({ type: "number" }, (textField) => (
      <div className={styles.fieldGroup}>
        <Text as="label" htmlFor={fieldName} className={styles.fieldLabel}>
          {textField.title}
        </Text>
        <TextInput
          id={fieldName}
          name={fieldName}
          value={String(value)}
          onChange={(e) => onChange(fieldName, e.target.valueAsNumber)}
          placeholder={textField.title}
          type={InputType.number}
          scale
          tabIndex={0}
        />
      </div>
    ))
    .with({ type: "text" }, (textField) => (
      <div className={styles.fieldGroup}>
        <Text as="label" htmlFor={fieldName} className={styles.fieldLabel}>
          {textField.title}
        </Text>
        <TextInput
          id={fieldName}
          name={fieldName}
          value={String(value)}
          onChange={(e) => onChange(fieldName, e.target.value)}
          placeholder={textField.title}
          type={InputType.text}
          scale
          tabIndex={0}
        />
      </div>
    ))
    .exhaustive();
};

export default ExternalDbField;
