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
import { inject, observer } from "mobx-react";
import { TextInput } from "@docspace/ui-kit/components/text-input";
import { Textarea } from "@docspace/ui-kit/components/textarea";
import { PasswordInput } from "@docspace/ui-kit/components/password-input";

const LdapFieldComponent = (props) => {
  const {
    isTextArea,
    removeErrorField,
    setErrorField,
    name,
    onChange,
    isPassword,
    dataTestId,
    ...rest
  } = props;

  const onChangeFn = (e) => {
    const { value, name: inputName } = e.target;

    if (value.trim() !== "") {
      removeErrorField(inputName);
    } else {
      setErrorField(inputName);
    }

    onChange && onChange(e);
  };

  // const onFocus = (e) => {
  //   const name = e.target.name;
  //   if (errors[name]) {
  //     removeErrorField(name);
  //   }
  // };

  const onBlur = (e) => {
    if (e.target.value.trim() === "") {
      setErrorField(e.target.name);
    }
  };

  if (isTextArea)
    return (
      <Textarea
        dataTestId={dataTestId ? `${dataTestId}_textarea` : undefined}
        name={name}
        onChange={onChangeFn}
        {...rest}
      />
    );

  if (isPassword) {
    return (
      <PasswordInput
        testId={dataTestId ? `${dataTestId}_password_input` : undefined}
        inputName={name}
        inputValue={rest?.value || ""}
        onBlur={onBlur}
        // onFocus={onFocus}
        onChange={onChangeFn}
        {...rest}
      />
    );
  }

  return (
    <TextInput
      testId={dataTestId ? `${dataTestId}_input` : undefined}
      name={name}
      onBlur={onBlur}
      // onFocus={onFocus}
      onChange={onChangeFn}
      {...rest}
    />
  );
};

export default inject(({ ldapStore }) => {
  const { errors, removeErrorField, setErrorField } = ldapStore;

  return {
    errors,
    removeErrorField,
    setErrorField,
  };
})(observer(LdapFieldComponent));
