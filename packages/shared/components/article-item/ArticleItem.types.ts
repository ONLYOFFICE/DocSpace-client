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

export type TArticleLinkDataState =
  | {
      title: string;
      isRoot: boolean;
      isPublicRoomType: boolean;
      rootFolderType: number;
      canCreate: boolean;
    }
  | object;

export type TArticleLinkData = {
  path: string;
  state: TArticleLinkDataState;
};

type PickedDivProps = Pick<
  React.ComponentProps<"div">,
  "id" | "className" | "style"
>;

export interface ArticleItemType {
  isRoom?: boolean;
  rootFolderType?: string;
  id?: string;
  roomType?: string;
  title?: string;
  shared?: boolean;
  external?: boolean;
  security?: {
    canCreate: boolean;
  };
}

export type ArticleItemProps = PickedDivProps & {
  /** Catalog item icon */
  icon?: string;
  /** Catalog item text */
  text: string;
  /** Sets the catalog item to display text */
  showText?: boolean;
  /** Invokes a function upon clicking on a catalog item */
  onClick?: (e: React.MouseEvent, id?: string) => void;
  /** Invokes a function upon dragging and dropping a catalog item */
  onDrop?: (id?: string, text?: string, item?: ArticleItemType) => void;
  /** Tells when the catalog item should display initial on icon, text should be hidden */
  showInitial?: boolean;
  /** Sets the catalog item as end of block */
  isEndOfBlock?: boolean;
  /** Sets catalog item active */
  isActive?: boolean;
  /** Sets the catalog item available for drag`n`drop */
  isDragging?: boolean;
  /** Sets the catalog item active for drag`n`drop */
  isDragActive?: boolean;
  /** Sets the catalog item to display badge */
  showBadge?: boolean;
  /** Label in catalog item badge */
  labelBadge?: string | number;
  /** Sets custom badge icon */
  iconBadge?: string;
  /** Invokes a function upon clicking on the catalog item badge */
  onClickBadge?: (id?: string) => void;
  /** Sets the catalog item to be displayed as a header */
  isHeader?: boolean;
  /** Disables margin top for catalog item header */
  isFirstHeader?: boolean;
  /** Accepts folder id */
  folderId?: string;
  /** Title for the badge tooltip */
  badgeTitle?: string;
  /** Custom badge component */
  badgeComponent?: React.ReactNode;
  /** Title for the item tooltip */
  title?: string;
  /** Link data for routing */
  linkData: TArticleLinkData;
  /** Item data */
  item?: ArticleItemType;
  /** Catalog item icon for SSR */
  iconNode?: React.ReactNode;
  withAnimation?: boolean;
  dataTooltipId?: string;
  isDisabledLink?: boolean;
};
