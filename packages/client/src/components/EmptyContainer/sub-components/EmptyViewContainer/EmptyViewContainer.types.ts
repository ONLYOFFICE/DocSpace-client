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
import { AuthStore } from "@docspace/shared/store/AuthStore";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";

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
      | "setSelectFileFormRoomDialogVisible"
      | "setQuotaWarningDialogVisible"
      | "setSelectFileAiKnowledgeDialogVisible"
      | "setTemplateAccessSettingsVisible"
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
  isPortalAdmin: AuthStore["isAdmin"];
  aiReady?: boolean;
  standalone: SettingsStore["standalone"];
  socialAuthWelcomeVisible: boolean;
  onSocialAuthWelcomeClose: () => void;
  tenantAlias: string;
  baseDomain: string | null;
  socialAuthUser: TStore["userStore"]["user"];
}

export type EmptyViewContainerProps = OutEmptyViewContainerProps &
  InjectedEmptyViewContainerProps;

export type OptionActions = {
  navigate: NavigateFunction;
  inviteUser: VoidFunction;
  onOpenAccessSettings: VoidFunction;
  onCreate: (
    extension: ExtensionType,
    withoutDialog?: boolean,
    t?: TTranslation,
  ) => void;
  uploadFromDocspace: (
    filterParam: FilesSelectorFilterTypes | FilterType | string,
    openRoot?: boolean,
  ) => void;
  uploadFromDocspaceAiKnowledge: VoidFunction;
  onUploadAction: (type: UploadType) => void;
  createAndCopySharedLink: VoidFunction;
  openInfoPanel: VoidFunction;
  onCreateRoom: VoidFunction;
  inviteRootUser: ContactsConextOptionsStore["inviteUser"];
  onGoToPersonal: () => LinkProps;
  onGoToShared: () => LinkProps;
  onCreateAIAgent: VoidFunction;
  onGoToServices: VoidFunction;
  onGoToAIProviderSettings: VoidFunction;
};
