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

import React, { useReducer, useCallback, useEffect } from "react";

import { ICompanySettings, IUseCompanySettings } from "./CompanyInfo.types";
import { isEqual } from "lodash";

const defaultCompanySettingsError = {
  hasErrorAddress: false,
  hasErrorCompanyName: false,
  hasErrorEmail: false,
  hasErrorPhone: false,
  hasErrorSite: false,
};

type TFields = Pick<
  ICompanySettings,
  "address" | "companyName" | "email" | "phone" | "site" | "hideAbout"
>;
type TValidators = "site" | "email" | "phone" | "companyName" | "address";
type TBooleanFields = keyof Pick<ICompanySettings, "hideAbout">;

interface IState {
  fields: TFields;
  errors: typeof defaultCompanySettingsError;
  initialFields: TFields;
  hasChanges: boolean;
}

type Action =
  | { type: "SET_FIELD"; field: TValidators; value: string }
  | {
      type: "SET_BOOLEAN_FIELD";
      field: TBooleanFields;
      value: boolean;
    }
  | { type: "RESET"; values: TFields };

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
      const hasChanges = !isEqual(
        state.initialFields[action.field],
        action.value,
      );

      return {
        fields: newFields,
        errors: {
          ...state.errors,
          [`hasError${action.field.charAt(0).toUpperCase() + action.field.slice(1)}`]:
            !isValid,
        },
        initialFields: state.initialFields,
        hasChanges,
      };
    }
    case "SET_BOOLEAN_FIELD": {
      const newFields = { ...state.fields, [action.field]: action.value };

      return {
        fields: newFields,
        errors: state.errors,
        initialFields: state.fields,
        hasChanges: true,
      };
    }
    case "RESET":
      return {
        fields: action.values,
        initialFields: action.values,
        errors: defaultCompanySettingsError,
        hasChanges: false,
      };
    default:
      return state;
  }
}

export const useCompanySettings = ({
  companySettings,
  displayAbout,
}: IUseCompanySettings) => {
  const initialSettings = {
    address: companySettings.address,
    companyName: companySettings.companyName,
    email: companySettings.email,
    phone: companySettings.phone,
    site: companySettings.site,
    hideAbout: !displayAbout,
  };

  const [state, dispatch] = useReducer(reducer, {
    fields: initialSettings,
    initialFields: initialSettings,
    errors: defaultCompanySettingsError,
    hasChanges: false,
  });

  const createChangeHandler = useCallback(
    (field: TValidators) => (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: "SET_FIELD", field, value: e.target.value });
    },
    [],
  );

  const createChangeBooleanHandler = useCallback(
    (field: TBooleanFields) => (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: "SET_BOOLEAN_FIELD", field, value: e.target.checked });
    },
    [],
  );

  useEffect(() => {
    dispatch({
      type: "RESET",
      values: {
        address: companySettings.address,
        companyName: companySettings.companyName,
        email: companySettings.email,
        phone: companySettings.phone,
        site: companySettings.site,
        hideAbout: companySettings.hideAbout,
      },
    });
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
    onChangeHideAbout: createChangeBooleanHandler("hideAbout"),
  };
};
