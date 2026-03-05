// (c) Copyright Ascensio System SIA 2009-2026
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

import type { ShareAccessRights } from "../../enums";
import type { TagClickEvent, TagType } from "@docspace/ui-kit/components/tag";

export interface TagManagementPopupProps {
  tags: Array<TagType | string>;
  roomId: string | number;
  onClose: VoidFunction;
  onSelectTag: (tag: TagClickEvent) => void;
  anchor: React.RefObject<HTMLElement | null>;

  onEditTag?: (oldLabel: string, newLabel: string) => Promise<void>;
  onDeleteTag?: (label: string) => Promise<void>;

  canRemove?: boolean;
  canCreate?: boolean;
  canSearch?: boolean;
  canEdit?: boolean;
  canBindTag?: boolean;
}

export type TTag = {
  label: string;
  checked: boolean;
};

export interface TagManagementProviderProps {
  children: React.ReactNode;
  fetchedTags: string[];
  roomTags: Array<TagType | string>;

  canRemove?: boolean;
  canCreate?: boolean;
  canSearch?: boolean;
  canEdit?: boolean;
  canBindTag?: boolean;
}
export interface ITagManagementStateContext {
  tags: TTag[];
  setTags: React.Dispatch<React.SetStateAction<TTag[]>>;
  searchValue: string;
  deferredSearchValue: string;
  filteredTags: TTag[];
  showCreateTag: boolean;
  setSearchValue: (value: string) => void;
  clearSearch: () => void;

  canRemove?: boolean;
  canCreate?: boolean;
  canSearch?: boolean;
  canEdit?: boolean;
  canBindTag?: boolean;
}

export interface TagManagementContextValue extends ITagManagementStateContext {}

export interface UpdateTagNameParams {
  oldLabel: string;
  newLabel: string;
}

export interface TagManagementContentProps {
  onSelectTag: (tag: TagClickEvent) => void;
  roomId: string | number;

  onDeleteTag?: (label: string) => Promise<void>;
  onEditTag?: (oldLabel: string, newLabel: string) => Promise<void>;
}

export interface TagManagementFilterProps {
  roomId: string | number;
}

export interface TagManagementProps {
  id: string | number;
  tags: Array<TagType | string>;
  columnCount: number;
  access: ShareAccessRights;
  isActive: boolean;
  className?: string;
  isAdmin: boolean;
  onSelectTag: (tag: TagClickEvent) => void;
}
