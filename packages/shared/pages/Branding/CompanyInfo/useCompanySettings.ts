// (c) Copyright Ascensio System SIA 2009-2025
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

import React, { useCallback, useState } from "react";

import { isEqual } from "lodash";
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
