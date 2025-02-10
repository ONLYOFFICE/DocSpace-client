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

import { CSSProperties, ReactNode } from "react";

export type EmptyScreenContainerProps = {
  /** URL source for the empty state image */
  imageSrc: string;
  /** Alternative text for the image for accessibility */
  imageAlt: string;
  /** Main header text displayed below the image */
  headerText: string;
  /** Optional subheading text displayed below the header */
  subheadingText?: string;
  /** Optional description text or React node displayed below the subheading */
  descriptionText?: string | ReactNode;
  /** Optional buttons or other interactive elements */
  buttons?: ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** HTML id attribute */
  id?: string;
  /** Custom CSS styles for the container */
  style?: CSSProperties;
  /** Custom CSS styles for the image */
  imageStyle?: CSSProperties;
  /** Custom CSS styles for the buttons container */
  buttonStyle?: CSSProperties;
  /** Whether to display without filter styling */
  withoutFilter?: boolean;
};
