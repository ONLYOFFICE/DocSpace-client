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

import { InputSize, InputType } from "../text-input";
import { EmailSettings } from "../../utils";

export type TValidate = { value: string; isValid: boolean; errors?: string[] };

export interface EmailInputProps {
  /** Accepts class */
  className?: string;
  /** Function for custom validation of the input value. Function must return object with following parameters: `value`: string value of input, `isValid`: boolean result of validating, `errors`(optional): array of errors */
  customValidate?: (value: string) => TValidate;
  /** { allowDomainPunycode: false, allowLocalPartPunycode: false, allowDomainIp: false, allowStrictLocalPart: true, allowSpaces: false, allowName: false, allowLocalDomainName: false } | Settings for validating email  */
  emailSettings?: EmailSettings;
  /** Used in custom validation  */
  hasError?: boolean;
  /** Supported size of the input fields.  */
  size: InputSize;
  /** Accepts id  */
  id?: string;
  /** Function for custom handling of input changes  */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Event that is triggered when the focused item is lost  */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** Function that validates the value, and returns the object with following parameters: `isValid`: boolean result of validating, `errors`: array of errors */
  onValidateInput?: (
    data: TValidate,
  ) => { isValid: boolean; errors: string[] } | undefined;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Value of the input */
  value: string;
  /** Used as HTML `autocomplete` property */
  autoComplete?: string;
  /** Indicates that the field cannot be used (e.g not authorised, or changes not saved)  */
  isDisabled?: boolean;
  /** Indicates that the field is displaying read-only content */
  isReadOnly?: boolean;
  /** Used as HTML `name` property  */
  name?: string;
  /** Placeholder text for the input  */
  placeholder?: string;
  /** Indicates that the input field has scale */
  scale?: boolean;
  /** Focus the input field on initial render */
  isAutoFocussed?: boolean;
  /** Supported type of the input fields. */
  type: InputType;
  /** Used as HTML `tabindex` property */
  tabIndex?: number;

  withBorder?: boolean;
  maxLength?: number;
  title?: string;
  handleAnimationStart: (e: React.AnimationEvent<HTMLInputElement>) => void;
}
