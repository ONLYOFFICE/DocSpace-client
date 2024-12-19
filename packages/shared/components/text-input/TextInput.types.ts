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

import { Mask } from "react-text-mask";

import { InputSize, InputType } from "./TextInput.enums";

export interface TextInputProps {
  /** Used as HTML `id` property */
  id?: string;
  /** Forwarded ref */
  forwardedRef?: React.Ref<HTMLInputElement>;
  /** Used as HTML `name` property */
  name?: string;
  /** Supported type of the input fields. */
  type: InputType;
  /** Value of the input */
  value: string;
  /** Default maxLength value of the input */
  maxLength?: number;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Used as HTML `tabindex` property */
  tabIndex?: number;
  /** input text mask */
  mask?: Mask | ((value: string) => Mask);
  /** Allows to add or delete characters without changing the positions of the existing characters. */
  keepCharPositions?: boolean;
  /** When guide is true, Text Mask always shows both placeholder characters and non-placeholder mask characters. */
  guide?: boolean | string;
  /** Supported size of the input fields. */
  size?: InputSize;
  /** Indicates the input field has scale */
  scale?: boolean;
  /** Called with the new value. Required when input is not read only. Parent should pass it back as `value` */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Called when field is blurred */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** Called when field is focused */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  onContextMenu?: (e: React.MouseEvent<HTMLInputElement>) => void;
  /** Focus the input field on initial render */
  isAutoFocussed?: boolean;
  /** Indicates that the field cannot be used (e.g not authorised, or changes not saved) */
  isDisabled?: boolean;
  /** Indicates that the field is displaying read-only content */
  isReadOnly?: boolean;
  /** Indicates the input field has an error */
  hasError?: boolean;
  /** Indicates the input field has a warning */
  hasWarning?: boolean;
  /** Used as HTML `autocomplete` property */
  autoComplete?: string;
  /** Accepts class */
  className?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Sets the font weight */
  fontWeight?: number | string;
  /** Sets font weight value to 600 */
  isBold?: boolean;
  /** Indicates that component contain border */
  withBorder?: boolean;
  dir?: string;
  inputMode?:
    | "text"
    | "email"
    | "search"
    | "tel"
    | "url"
    | "none"
    | "numeric"
    | "decimal";
}
