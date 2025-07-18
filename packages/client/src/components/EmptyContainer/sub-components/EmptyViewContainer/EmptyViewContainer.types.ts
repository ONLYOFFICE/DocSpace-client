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

import type { NavigateFunction, LinkProps } from "react-router";

import type {
  FilesSelectorFilterTypes,
  FilterType,
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import type { Nullable, TTranslation } from "@docspace/shared/types";
import ContactsConextOptionsStore from "SRC_DIR/store/contacts/ContactsContextOptionsStore";

export type UploadType = "pdf" | "file" | "folder";

export type FolderExtensionType = undefined;

export type ExtensionType =
  | "docx"
  | "xlsx"
  | "pptx"
  | "pdf"
  | FolderExtensionType;

export type CreateEvent = Event & {
  payload?: {
    extension: ExtensionType;
    id: number;
    withoutDialog?: boolean;
  };
};

export type AccessType = Nullable<ShareAccessRights> | undefined;

export interface OutEmptyViewContainerProps {
  type: RoomsType;
  folderId: number;

  parentRoomType: Nullable<FolderType>;
  folderType: Nullable<FolderType>;
  isFolder: boolean;
  isArchiveFolderRoot: boolean;
  isRootEmptyPage: boolean;
  logoText: string;
}

export interface InjectedEmptyViewContainerProps
  extends Pick<
      TStore["contextOptionsStore"],
      "onCreateAndCopySharedLink" | "onClickInviteUsers"
    >,
    Pick<ContactsConextOptionsStore, "inviteUser">,
    Pick<
      TStore["dialogsStore"],
      "setSelectFileFormRoomDialogVisible" | "setQuotaWarningDialogVisible"
    >,
    Pick<
      TStore["selectedFolderStore"],
      "access" | "security" | "rootFolderType"
    >,
    Pick<TStore["treeFoldersStore"], "myFolder" | "myFolderId" | "roomsFolder">,
    Pick<TStore["clientLoadingStore"], "setIsSectionFilterLoading"> {
  selectedFolder: ReturnType<
    TStore["selectedFolderStore"]["getSelectedFolder"]
  >;
  userId: string | undefined;
  isVisibleInfoPanel: boolean;
  isWarningRoomsDialog: boolean;
  setVisibleInfoPanel: (arg: boolean) => void;
  setViewInfoPanel: TStore["infoPanelStore"]["setView"];
  isPublicRoom: boolean;
  isVisitor?: boolean;
  isFrame?: boolean;
  logoText: string;
  isKnowledgeTab?: boolean;
  isResultsTab?: boolean;
  isAIRoom?: boolean;
}

export type EmptyViewContainerProps = OutEmptyViewContainerProps &
  InjectedEmptyViewContainerProps;

export type OptionActions = {
  navigate: NavigateFunction;
  inviteUser: VoidFunction;
  onCreate: (
    extension: ExtensionType,
    withoutDialog?: boolean,
    t?: TTranslation,
  ) => void;
  uploadFromDocspace: (
    filterParam: FilesSelectorFilterTypes | FilterType | string,
    openRoot?: boolean,
  ) => void;
  onUploadAction: (type: UploadType) => void;
  createAndCopySharedLink: VoidFunction;
  openInfoPanel: VoidFunction;
  onCreateRoom: VoidFunction;
  inviteRootUser: ContactsConextOptionsStore["inviteUser"];
  onGoToPersonal: () => LinkProps;
  onGoToShared: () => LinkProps;
};
