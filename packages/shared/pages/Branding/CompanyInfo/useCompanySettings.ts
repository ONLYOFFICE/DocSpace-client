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

import React, { useCallback, useState } from "react";

import isEqual from "lodash/isEqual";
import { ICompanySettings, IUseCompanySettings } from "./CompanyInfo.types";

const errors = {
  site: false,
  email: false,
  phone: false,
  companyName: false,
  address: false,
};

type TFields = Pick<
  ICompanySettings,
  "address" | "companyName" | "email" | "phone" | "site"
> & { displayAbout: boolean };

type TValidators = "site" | "email" | "phone" | "companyName" | "address";

const validators: Record<TValidators, (v: string) => boolean> = {
  site: (v) => /^(ftp|http|https):\/\/[^ "]+$/.test(v),
  email: (v) => /.+@.+\..+/.test(v),
  phone: (v) => /^[\d\(\)\-\s+]+$/.test(v),
  companyName: (v) => v.trim() !== "",
  address: (v) => v.trim() !== "",
};

export const useCompanySettings = ({
  companySettings,
  displayAbout,
}: IUseCompanySettings) => {
  const settingsData = {
    address: companySettings.address,
    companyName: companySettings.companyName,
    email: companySettings.email,
    phone: companySettings.phone,
    site: companySettings.site,
    displayAbout,
  };

  const [settingsFormData, setSettingsFormData] = useState<Partial<TFields>>(
    {},
  );

  const formData = {
    ...settingsData, // from backend
    ...settingsFormData, // user input
  };

  const isDirty = !isEqual(formData, settingsData);

  const validate = () => {
    Object.keys(validators).forEach((key) => {
      const validatorKey = key as TValidators;
      const isValid = validators[validatorKey](formData[validatorKey]);
      errors[validatorKey] = !isValid;
    });
    return errors;
  };

  const createChangeHandler = useCallback(
    (field: keyof TFields) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setSettingsFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const reset = () => setSettingsFormData({});

  return {
    ...formData,
    reset,
    companySettingsError: validate(),
    hasChanges: isDirty,
    onChangeAddress: createChangeHandler("address"),
    onChangeCompanyName: createChangeHandler("companyName"),
    onChangeEmail: createChangeHandler("email"),
    onChangePhone: createChangeHandler("phone"),
    onChangeSite: createChangeHandler("site"),
    onChangeDisplayAbout: createChangeHandler("displayAbout"),
  };
};
