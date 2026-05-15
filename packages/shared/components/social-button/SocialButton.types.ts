/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { JSX } from "react";

export type IconOptions = {
  color: string;
};
export type SocialButtonSize = "base" | "small";

export type StyledSocialButtonProps = {
  /** Accepts id */
  id?: string;
  /** Accepts tabindex prop */
  tabIndex: number;

  noHover: boolean;
  /** Changes the button style if the user is connected to the social network account */
  isConnect: boolean;
  /** Accepts class */
  className?: string;
  /** Sets the button to present a disabled state */
  isDisabled: boolean;
  /** Sets the image size. Contains the small and the basic size options */
  size: SocialButtonSize;
  /** Accepts the icon options  */
  $iconOptions?: IconOptions;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Sets a callback function that is triggered when the button is clicked */
  onClick?: (e: React.MouseEvent<Element, MouseEvent>) => void;
};

export type SocialButtonProps = Partial<StyledSocialButtonProps> & {
  /** Button text */
  label?: string | React.ReactNode;
  /** Button icon */
  iconName?: string;

  "data-url"?: string;
  "data-providername"?: string;

  IconComponent?: JSX.ElementType;
  dataTestId?: string;
};
