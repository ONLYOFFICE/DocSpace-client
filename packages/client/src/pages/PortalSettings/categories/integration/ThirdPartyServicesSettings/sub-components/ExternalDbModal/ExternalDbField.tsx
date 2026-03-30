// (c) Copyright Ascensio System SIA 2009-2026
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
          inputValue={String(value)}
          onChange={(e) => onChange(fieldName, e.target.value)}
          placeholder={passwordField.title}
          scale
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
          value={String(value)}
          onChange={(e) => onChange(fieldName, e.target.valueAsNumber)}
          placeholder={textField.title}
          type={InputType.number}
          scale
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
          value={String(value)}
          onChange={(e) => onChange(fieldName, e.target.value)}
          placeholder={textField.title}
          type={InputType.text}
          scale
        />
      </div>
    ))
    .exhaustive();
};

export default ExternalDbField;
