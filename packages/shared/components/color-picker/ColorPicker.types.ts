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

export type ColorPickerProps = {
  /** Optional CSS class name for custom styling */
  className?: string;

  /** HTML id attribute for the component */
  id?: string;

  /** Callback function triggered when the color picker is closed
   * @returns void
   */
  onClose?: () => void;

  /** If true, displays only the color picker without hex input and control buttons
   * @default false
   */
  isPickerOnly: boolean;

  /** Callback function triggered when the color is applied
   * @param color - The selected color in hex format
   * @returns void
   */
  onApply?: (color: string) => void;

  /** The currently selected color in hex format */
  appliedColor: string;

  /** Custom label for the apply button
   * @default "Apply"
   */
  applyButtonLabel?: string;

  /** Custom label for the cancel button
   * @default "Cancel"
   */
  cancelButtonLabel?: string;

  /** Callback function triggered on every color change
   * @param color - The current color in hex format
   * @returns void
   */
  handleChange?: (color: string) => void;

  /** Custom label for the hex code input field
   * @default "Hex code"
   */
  hexCodeLabel?: string;

  /** React ref object for the component's root div element */
  forwardedRef?: React.RefObject<HTMLDivElement | null>;
};
