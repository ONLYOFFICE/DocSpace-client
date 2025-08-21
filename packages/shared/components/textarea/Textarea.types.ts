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

import { ChangeEvent } from "react";

export type TextareaProps = {
  /** Class name */
  className?: string;
  /** Wrapper class name */
  wrapperClassName?: string;
  /** Used as HTML `id` property  */
  id?: string;
  /** Indicates that the field cannot be used */
  isDisabled?: boolean;
  /** Indicates that the field is displaying read-only content */
  isReadOnly?: boolean;
  /** Indicates the input field has an error  */
  hasError?: boolean;
  /** Indicates the input field has scale */
  heightScale?: boolean;
  /** Max value length */
  maxLength?: number;
  /** Used as HTML `name` property  */
  name?: string;
  /** Sets a callback function that allows handling the component's changing events */
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  /** Placeholder for Textarea  */
  placeholder?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Used as HTML `tabindex` property */
  tabIndex?: number;
  /** Textarea value */
  value?: string;
  /** Font-size value */
  fontSize?: number;
  /** Text-area height value */
  heightTextArea?: string | number;
  /** Specifies the text color */
  color?: string;
  /** Default input property */
  autoFocus?: boolean;
  /** Allows selecting the textarea */
  areaSelect?: boolean;
  /** Prettifies Json and adds lines numeration */
  isJSONField?: boolean;
  /** Indicates the text of toast/informational alarm */
  copyInfoText?: string;
  /** Shows copy icon */
  enableCopy?: boolean;
  /** Inserts numeration */
  hasNumeration?: boolean;
  /** Calculating height of content depending on number of lines */
  isFullHeight?: boolean;
  /** Calculated height of content depending on number of lines in pixels */
  fullHeight?: number;
  /** Minimum height of the textarea. */
  minHeight?: string;

  classNameCopyIcon?: string;
  paddingLeftProp?: string;

  isChatMode?: boolean;
  dataTestId?: string;
};
