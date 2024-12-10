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

import React, { useReducer, useCallback, useEffect } from "react";
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

interface IState {
  fields: Pick<
    ICompanySettings,
    "address" | "companyName" | "email" | "phone" | "site"
  >;
  errors: typeof defaultCompanySettingsError;
  hasChanges: boolean;
}

type Action =
  | { type: "SET_FIELD"; field: TValidators; value: string }
  | { type: "RESET"; values: ICompanySettings };

const validators: Record<TValidators, (v: string) => boolean> = {
  site: (v) => /^(ftp|http|https):\/\/[^ "]+$/.test(v),
  email: (v) => /.+@.+\..+/.test(v),
  phone: (v) => /^[\d\(\)\-\s+]+$/.test(v),
  companyName: (v) => v.trim() !== "",
  address: (v) => v.trim() !== "",
};

function reducer(state: IState, action: Action): IState {
  switch (action.type) {
    case "SET_FIELD": {
      const newFields = { ...state.fields, [action.field]: action.value };
      const isValid = validators[action.field](action.value);

      return {
        fields: newFields,
        errors: {
          ...state.errors,
          [`hasError${action.field.charAt(0).toUpperCase() + action.field.slice(1)}`]:
            !isValid,
        },
        hasChanges: true,
      };
    }
    case "RESET":
      return {
        fields: {
          address: action.values.address,
          companyName: action.values.companyName,
          email: action.values.email,
          phone: action.values.phone,
          site: action.values.site,
        },
        errors: defaultCompanySettingsError,
        hasChanges: false,
      };
    default:
      return state;
  }
}

export const useCompanySettings = (companySettings: ICompanySettings) => {
  const [state, dispatch] = useReducer(reducer, {
    fields: {
      address: companySettings.address,
      companyName: companySettings.companyName,
      email: companySettings.email,
      phone: companySettings.phone,
      site: companySettings.site,
    },
    errors: defaultCompanySettingsError,
    hasChanges: false,
  });

  const createChangeHandler = useCallback(
    (field: TValidators) => (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: "SET_FIELD", field, value: e.target.value });
    },
    [],
  );

  useEffect(() => {
    dispatch({ type: "RESET", values: companySettings });
  }, [companySettings]);

  return {
    ...state.fields,
    companySettingsError: state.errors,
    hasChanges: state.hasChanges,
    onChangeAddress: createChangeHandler("address"),
    onChangeCompanyName: createChangeHandler("companyName"),
    onChangeEmail: createChangeHandler("email"),
    onChangePhone: createChangeHandler("phone"),
    onChangeSite: createChangeHandler("site"),
  };
};
