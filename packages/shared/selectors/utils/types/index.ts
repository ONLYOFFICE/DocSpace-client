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
import type { TSelectorItem } from "../../../components/selector";
import { TBreadCrumb } from "../../../components/selector/Selector.types";

import { RoomsType } from "../../../enums";
import { TRoomSecurity } from "../../../api/rooms/types";

import {
  TFileSecurity,
  TFolder,
  TFolderSecurity,
} from "../../../api/files/types";

export type TUseInputItemHelper = {
  withCreate?: boolean;
  selectedItemId?: string | number | undefined;
  setItems?: React.Dispatch<React.SetStateAction<TSelectorItem[]>>;
};

export type TGetIcon = (size: number, fileExst: string) => string;

export type UseRoomsHelperProps = TUseInputItemHelper & {
  isAgent?: boolean;
  searchValue?: string;
  searchArea?: string;
  disableThirdParty?: boolean;
  isRoomsOnly: boolean;
  roomType?: RoomsType | RoomsType[];
  excludeItems?: (number | string | undefined)[];
  isInit: boolean;
  createDefineRoomLabel?: string;
  createDefineRoomType?: RoomsType;
  onSetBaseFolderPath?: (
    value: number | string | undefined | TBreadCrumb[],
  ) => void;
  getRootData?: () => Promise<void>;
  subscribe: (id: number) => void;
  withInit?: boolean;
  setIsInit: (value: boolean) => void;
  setBreadCrumbs?: React.Dispatch<React.SetStateAction<TBreadCrumb[]>>;
  setHasNextPage: (value: boolean) => void;
  setTotal: (value: number) => void;
  setIsRoot?: (value: boolean) => void;
  setSelectedItemType?: React.Dispatch<
    React.SetStateAction<"rooms" | "files" | "agents" | undefined>
  >;
  setSelectedItemSecurity?: React.Dispatch<
    React.SetStateAction<
      TRoomSecurity | TFileSecurity | TFolderSecurity | undefined
    >
  >;
  setSelectedTreeNode?: React.Dispatch<React.SetStateAction<TFolder>>;
};

export type UseAgentsHelperProps = TUseInputItemHelper & {
  searchValue?: string;
  // isRoomsOnly: boolean;
  excludeItems?: (number | string | undefined)[];
  isInit: boolean;
  createDefineLabel?: string;
  onSetBaseFolderPath?: (
    value: number | string | undefined | TBreadCrumb[],
  ) => void;
  getRootData?: () => Promise<void>;
  subscribe: (id: number) => void;
  withInit?: boolean;
  setIsInit: (value: boolean) => void;
  setBreadCrumbs?: React.Dispatch<React.SetStateAction<TBreadCrumb[]>>;
  setHasNextPage: (value: boolean) => void;
  setTotal: (value: number) => void;
  setIsRoot?: (value: boolean) => void;
  setSelectedItemType?: React.Dispatch<
    React.SetStateAction<"rooms" | "files" | "agents" | undefined>
  >;
  setSelectedItemSecurity?: React.Dispatch<
    React.SetStateAction<
      TRoomSecurity | TFileSecurity | TFolderSecurity | undefined
    >
  >;
  setSelectedTreeNode?: React.Dispatch<React.SetStateAction<TFolder>>;
};

export type UseSocketHelperProps = {
  setItems: React.Dispatch<React.SetStateAction<TSelectorItem[]>>;
  setBreadCrumbs?: React.Dispatch<React.SetStateAction<TBreadCrumb[]>>;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
  disabledItems: (string | number)[];
  filterParam?: string | number;
  withCreate?: boolean;
};
