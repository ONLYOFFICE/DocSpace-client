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

export interface RadioButtonProps {
  /** Used as HTML `checked` property for each `<input>` tag */
  isChecked?: boolean;
  /** Used as HTML `disabled` property for each `<input>` tag */
  isDisabled?: boolean;
  /** Radiobutton name. In case the name is not stated, `value` is used */
  label?: React.ReactNode | string;
  /** Link font size */
  fontSize?: string;
  /** Link font weight */
  fontWeight?: number;
  /** Used as HTML `name` property for `<input>` tag. */
  name: string;
  /** Allows handling the changing events of the component  */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Allows handling component clicking events */
  onClick?: (
    e: React.MouseEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>,
  ) => void;
  /** Used as HTML `value` property for `<input>` tag. Facilitates identification of each radiobutton  */
  value: string;
  /** Sets margin between radiobuttons. In case the orientation is `horizontal`,
   * `margin-left` is applied for all radiobuttons, except the first one.
   * In case the orientation is `vertical`, `margin-bottom` is applied for all radiobuttons, except the last one */
  spacing?: string;
  /** Accepts class  */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style  */
  style?: React.CSSProperties;
  /** Position of radiobuttons */
  orientation?: "horizontal" | "vertical";
  classNameInput?: string;
  autoFocus?: boolean;
}
