// (c) Copyright Ascensio System SIA 2009-2024
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

import React, { useState, useCallback, useEffect } from "react";
import isEqual from "lodash/isEqual";

import { ICompanySettings } from "./CompanyInfo.types";

const defaultCompanySettingsError = {
  hasErrorAddress: false,
  hasErrorCompanyName: false,
  hasErrorEmail: false,
  hasErrorPhone: false,
  hasErrorSite: false,
};

type TValidators = "site" | "email" | "phone" | "companyName" | "address";

export const useCompanySettings = (companySettings: ICompanySettings) => {
  const [address, setAddress] = useState(companySettings.address);
  const [companyName, setCompanyName] = useState(companySettings.companyName);
  const [email, setEmail] = useState(companySettings.email);
  const [phone, setPhone] = useState(companySettings.phone);
  const [site, setSite] = useState(companySettings.site);
  const [companySettingsError, setCompanySettingsError] = useState(
    defaultCompanySettingsError,
  );
  const [hasChanges, setHasChanges] = useState(false);

  const validateField = useCallback((value: string, type: TValidators) => {
    const validators = {
      site: (v: string) => /^(ftp|http|https):\/\/[^ "]+$/.test(v),
      email: (v: string) => /.+@.+\..+/.test(v),
      phone: (v: string) => /^[\d\(\)\-\s+]+$/.test(v),
      companyName: (v: string) => v.trim() !== "",
      address: (v: string) => v.trim() !== "",
    };

    const isValid = validators[type]?.(value) ?? true;
    const errorKey = `hasError${type.charAt(0).toUpperCase() + type.slice(1)}`;

    setCompanySettingsError((prev) => ({
      ...prev,
      [errorKey]: !isValid,
    }));

    return isValid;
  }, []);

  const onChangeAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateField(e.target.value, "address");
    setAddress(e.target.value);
  };

  const onChangeCompanyName = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateField(e.target.value, "companyName");
    setCompanyName(e.target.value);
  };

  const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateField(e.target.value, "email");
    setEmail(e.target.value);
  };

  const onChangePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateField(e.target.value, "phone");
    setPhone(e.target.value);
  };

  const onChangeSite = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateField(e.target.value, "site");
    setSite(e.target.value);
  };

  useEffect(() => {
    const settings = {
      address,
      companyName,
      email,
      phone,
      site,
      isDefault: companySettings.isDefault,
      isLicensor: companySettings.isLicensor,
    };
    if (isEqual(companySettings, settings)) {
      setHasChanges(false);
    } else {
      setHasChanges(true);
    }
  }, [address, companyName, email, phone, site, companySettings]);

  useEffect(() => {
    setAddress(companySettings.address);
    setCompanyName(companySettings.companyName);
    setEmail(companySettings.email);
    setPhone(companySettings.phone);
    setSite(companySettings.site);
  }, [companySettings]);

  return {
    address,
    companyName,
    email,
    phone,
    site,
    companySettingsError,
    hasChanges,
    onChangeAddress,
    onChangeCompanyName,
    onChangeEmail,
    onChangePhone,
    onChangeSite,
  };
};
