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

export type FileInputProps = {
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Supported size of the input fields */
  size: InputSize;
  /** Indicates that the input field has scale */
  scale?: boolean;
  /** Accepts class */
  className?: string;
  /** Indicates that the input field has an error */
  hasError?: boolean;
  /** Indicates that the input field has a warning */
  hasWarning?: boolean;
  /** Used as HTML `id` property */
  id?: string;
  /** Indicates that the field cannot be used (e.g not authorised, or changes not saved) */
  isDisabled?: boolean;
  /** Tells when the button should show loader icon */
  isLoading?: boolean;
  /** Used as HTML `name` property */
  name?: string;
  /** Called when a file is selected */
  onInput?: (file: File | File[]) => void;
  /** Specifies the files visible for upload */
  accept?: string[];
  /** Specifies the label for the upload button */
  buttonLabel?: string;
  /** Indicates that icon is document. Otherwise, it is folder icon */
  isDocumentIcon?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  idButton?: string;
  path?: string;
  fromStorage?: boolean;
  /** Indicates that the input may contain multiple files. */
  isMultiple?: boolean;
  /** ARIA label for the file input button */
  "aria-label"?: string;
  /** ARIA description for the file input */
  "aria-description"?: string;
  /** Data attributes for testing */
  "data-test-id"?: string;
};
