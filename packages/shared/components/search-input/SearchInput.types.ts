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

import React from "react";

import { InputSize } from "../text-input";

export type SearchInputProps = {
  /** Used as HTML `id` property */
  id?: string;
  /** Forwarded ref */
  forwardedRef?: React.Ref<HTMLInputElement>;
  /** Sets the unique element name */
  name?: string;
  /** Accepts class */
  className?: string;
  /** Supported size of the input fields. */
  size: InputSize;
  /** Input value */
  value: string;
  /** Indicates that the input field has scale  */
  scale?: boolean;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Sets a callback function that allows handling the component's changing events */
  onChange?: (value: string) => void;
  /** Sets a callback function that is triggered when the clear icon of the search input is clicked */
  onClearSearch?: () => void;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  /** Indicates that the field cannot be used (e.g not authorized, or the changes have not been saved) */
  isDisabled?: boolean;
  /** Displays the Clear Button */
  showClearButton?: boolean;
  /** Sets the refresh timeout of the input  */
  refreshTimeout?: number;
  /** Sets the input to refresh automatically */
  autoRefresh?: boolean;
  /** Child elements */
  children?: React.ReactNode;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** The callback function that is called when the field is focused  */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** Determines whether the input should reset to the original value when focus is lost */
  resetOnBlur?: boolean;
  /** Added data-testid for testing  */
  dataTestId?: string;
};
