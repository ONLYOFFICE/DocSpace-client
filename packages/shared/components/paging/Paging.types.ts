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

import { TOption } from "../combobox";

export interface PagingProps {
  /** Label for the previous button */
  previousLabel: string;
  /** Label for the next button */
  nextLabel: string;
  /** Action for the previous button */
  previousAction: (e?: React.MouseEvent) => Promise<void> | void;
  /** Action for the next button */
  nextAction: (e?: React.MouseEvent) => Promise<void> | void;
  /** Sets previous button disabled */
  disablePrevious?: boolean;
  /** Sets the next button disabled */
  disableNext?: boolean;
  /** Initial value for pageItems */
  selectedPageItem: TOption;
  /** Initial value for countItems */
  selectedCountItem: TOption;
  /** Sets a callback function that is triggered when the page is selected */
  onSelectPage?: (option: TOption) => Promise<void> | void;
  /** Sets a callback function that is triggered when the page items are selected */
  onSelectCount?: (option: TOption) => Promise<void> | void;
  /** Paging combo box items */
  pageItems: TOption[];
  /** Items per page combo box items */
  countItems: TOption[];
  /** Indicates opening direction of combo box */
  openDirection?: "bottom" | "top" | "both";
  /** Accepts class */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Displays a combobox with the number of items per page */
  showCountItem?: boolean;
}
