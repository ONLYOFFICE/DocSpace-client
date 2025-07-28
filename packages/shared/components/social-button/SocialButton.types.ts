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
  testId?: string;
};
