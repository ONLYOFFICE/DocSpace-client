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

import { TDirectionY } from "../../types";

export type TagType = {
  /** Accepts a unique key for the tag. */
  key?: string;
  /** Indicates if the tag is a default tag. */
  isDefault?: boolean;
  /** Indicates if the tag is associated with a third-party provider. */
  isThirdParty?: boolean;
  /** Accepts the tag label */
  label: string;
  /** Accepts the max width of the tag */
  maxWidth?: string;
  /** Accepts the dropdown options */
  advancedOptions?: React.ReactNode[];
  /** Accepts the tag styles as disabled and disables clicking */
  isDisabled?: boolean;
  /** Indicates the type of room associated with the tag. */
  roomType?: number;
  /** Accepts the icon associated with the tag. */
  icon?: string;
  /** Indicates the type of provider associated with the tag. */
  providerType?: number;
  onClick?: () => void;
};

export type TagsProps = {
  /** Accepts id */
  id?: string;
  /** Accepts the tags */
  tags: Array<TagType | string>;
  /** Accepts class */
  className?: string;
  /** Accepts the tag column count */
  columnCount: number;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Accepts the function that is called when the tag is selected */
  onSelectTag: (tag?: object) => void;
  removeTagIcon?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  showCreateTag?: boolean;
  /** Controls whether the dropdown uses portal mode or not */
  isDefaultMode?: boolean;
  /** Sets the opening direction relative to the parent */
  directionY?: TDirectionY;
  /** Disables check position. Used to set the direction explicitly */
  fixedDirection?: boolean;
  /** Required for specifying the exact distance from the parent component */
  manualY?: string;
  /** Required for specifying the exact distance from the parent component */
  manualX?: string;
};
