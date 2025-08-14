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

import React, { type JSX } from "react";
import { P, match } from "ts-pattern";
import { isMobile } from "react-device-detect";

import {
  EmployeeType,
  FilesSelectorFilterTypes,
  FilterType,
  FolderType,
  RoomsType,
  SearchArea,
  ShareAccessRights,
} from "@docspace/shared/enums";

import CreateNewFormIcon from "PUBLIC_DIR/images/emptyview/create.new.form.svg";
import CreatePDFFormIcon from "PUBLIC_DIR/images/emptyview/create.pdf.form.svg";
import CreateNewSpreadsheetIcon from "PUBLIC_DIR/images/emptyview/create.new.spreadsheet.svg";
import CreateNewPresentation from "PUBLIC_DIR/images/emptyview/create.new.presentation.svg";
import CreateRoom from "PUBLIC_DIR/images/emptyview/create.room.svg";
import InviteUserFormIcon from "PUBLIC_DIR/images/emptyview/invite.user.svg";
import UploadDevicePDFFormIcon from "PUBLIC_DIR/images/emptyview/upload.device.pdf.form.svg";
import PersonIcon from "PUBLIC_DIR/images/icons/12/person.svg";
import FolderIcon from "PUBLIC_DIR/images/icons/12/folder.svg";
import FormBlankIcon from "PUBLIC_DIR/images/form.blank.react.svg?url";
import CreateChatIcon from "PUBLIC_DIR/images/emptyview/create.chat.svg";
import SharedIcon from "PUBLIC_DIR/images/emptyview/share-view.svg";

import DocumentsReactSvgUrl from "PUBLIC_DIR/images/actions.documents.react.svg?url";
import SpreadsheetReactSvgUrl from "PUBLIC_DIR/images/spreadsheet.react.svg?url";
import PresentationReactSvgUrl from "PUBLIC_DIR/images/actions.presentation.react.svg?url";
import FormReactSvgUrl from "PUBLIC_DIR/images/access.form.react.svg?url";
import FolderReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";

import type { Nullable, TTranslation } from "@docspace/shared/types";
import type { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import type { TFolderSecurity } from "@docspace/shared/api/files/types";
import type {
  EmptyViewItemType,
  EmptyViewOptionsType,
} from "@docspace/shared/components/empty-view";
import FilesFilter from "@docspace/shared/api/files/filter";

import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { CategoryType } from "SRC_DIR/helpers/constants";

import type { AccessType, OptionActions } from "./EmptyViewContainer.types";
import { DefaultFolderType } from "./EmptyViewContainer.constants";
import {
  getFolderDescription,
  getFolderIcon,
  getFolderTitle,
  getRoomDescription,
  getRoomIcon,
  getRoomTitle,
  getRootDescription,
  getRootIcon,
  getRootTitle,
  helperOptions,
  isAdmin,
  isUser,
} from "./EmptyViewContainer.utils";

export const getDescription = (
  type: RoomsType,
  t: TTranslation,
  access: AccessType,
  isFolder: boolean,
  folderType: Nullable<FolderType>,
  parentRoomType: Nullable<FolderType>,
  isArchiveFolderRoot: boolean,
  isRootEmptyPage: boolean,
  rootFolderType: Nullable<FolderType>,
  isPublicRoom: boolean,
  security: Nullable<TFolderSecurity>,
  isKnowledgeTab?: boolean,
  isResultsTab?: boolean,
  isAIRoom?: boolean,
): React.ReactNode => {
  const isNotAdmin = isUser(access);

  if (isAIRoom) {
    if (isKnowledgeTab) return t("AIRoom:EmptyKnowledgeDescription");

    if (isResultsTab) return t("AIRoom:EmptyResultsDescription");
  }

  if (isRootEmptyPage)
    return getRootDescription(
      t,
      access,
      rootFolderType,
      isPublicRoom,
      security,
    );

  if (isFolder)
    return getFolderDescription(
      t,
      access,
      isNotAdmin,
      isArchiveFolderRoot,
      folderType,
      parentRoomType,
    );

  return getRoomDescription(t, isNotAdmin, isArchiveFolderRoot);
};

export const getTitle = (
  type: RoomsType,
  t: TTranslation,
  access: AccessType,
  isFolder: boolean,
  folderType: Nullable<FolderType>,
  parentRoomType: Nullable<FolderType>,
  isArchiveFolderRoot: boolean,
  isRootEmptyPage: boolean,
  rootFolderType: Nullable<FolderType>,
  isKnowledgeTab?: boolean,
  isResultsTab?: boolean,
  isAIRoom?: boolean,
): string => {
  const isNotAdmin = isUser(access);

  if (isAIRoom) {
    if (isKnowledgeTab) return t("AIRoom:EmptyKnowledgeTitle");

    if (isResultsTab) return t("AIRoom:EmptyResultsTitle");
  }

  if (isRootEmptyPage) return getRootTitle(t, access, rootFolderType);

  if (isFolder)
    return getFolderTitle(
      t,
      isNotAdmin,
      isArchiveFolderRoot,
      access,
      folderType,
      parentRoomType,
    );

  return getRoomTitle(t, type, access, isNotAdmin, isArchiveFolderRoot);
};

export const getIcon = (
  type: RoomsType,
  isBaseTheme: boolean,
  access: AccessType,
  isFolder: boolean,
  folderType: Nullable<FolderType>,
  parentRoomType: Nullable<FolderType>,
  isRootEmptyPage: boolean,
  rootFolderType: Nullable<FolderType>,
): JSX.Element => {
  if (isRootEmptyPage) return getRootIcon(rootFolderType, access, isBaseTheme);
  return isFolder
    ? getFolderIcon(parentRoomType, isBaseTheme, access, folderType)
    : getRoomIcon(type, isBaseTheme, access)!;
};

export const getOptions = (
  type: RoomsType,
  security: Nullable<TFolderSecurity | TRoomSecurity>,
  t: TTranslation,
  access: AccessType,
  isFolder: boolean,
  folderType: Nullable<FolderType>,
  parentRoomType: Nullable<FolderType>,
  isArchiveFolderRoot: boolean,
  isRootEmptyPage: boolean,
  rootFolderType: Nullable<FolderType>,
  actions: OptionActions,
  logoText: string,
  isVisitor: boolean = true,
  isFrame: boolean = false,
  isKnowledgeTab?: boolean,
  isResultsTab?: boolean,
  isAIRoom?: boolean,
): EmptyViewOptionsType => {
  const isFormFiller = access === ShareAccessRights.FormFilling;
  const isCollaborator = access === ShareAccessRights.Collaborator;
  const isNotAdmin = isUser(access);

  const {
    createInviteOption,
    // createCreateFileOption,
    createUploadFromDocSpace,
    createUploadFromDeviceOption,
  } = helperOptions(actions, security, isFrame);

  const uploadPDFFromDocSpace = createUploadFromDocSpace(
    t("EmptyView:UploadFromPortalTitle", {
      productName: t("Common:ProductName"),
    }),
    t("EmptyView:UploadPDFFormOptionDescription", {
      productName: t("Common:ProductName"),
    }),
    FilterType.PDFForm,
  );

  const uploadAllFromDocSpace = createUploadFromDocSpace(
    t("EmptyView:UploadFromPortalTitle", {
      productName: t("Common:ProductName"),
    }),
    t("EmptyView:SectionsUploadDescription", {
      sectionNameFirst: t("Common:MyFilesSection"),
      sectionNameSecond: t("Common:Rooms"),
    }),
    // TODO: need fix selector
    FilesSelectorFilterTypes.ALL,
  );

  const uploadFromDevicePDF = createUploadFromDeviceOption(
    t("EmptyView:UploadDevicePDFFormOptionTitle"),
    t("EmptyView:UploadDevicePDFFormOptionDescription"),
    "pdf",
  );

  const inviteUser = createInviteOption(
    t("Common:InviteContacts"),
    t("EmptyView:InviteUsersOptionDescription", {
      productName: t("Common:ProductName"),
    }),
  );

  const shareFillingRoom = {
    title: t("EmptyView:ShareOptionTitle"),
    description: t("EmptyView:ShareOptionDescription"),
    icon: <SharedIcon />,
    key: "share-room",
    onClick: actions.createAndCopySharedLink,
    disabled: !security?.EditAccess || isFrame,
  };

  const sharePublicRoom = {
    title: t("EmptyView:SharePublicRoomOptionTitle"),
    description: t("EmptyView:SharePublicRoomOptionDescription"),
    icon: <SharedIcon />,
    key: "share-public-room",
    onClick: actions.createAndCopySharedLink,
    disabled: isFrame,
  };

  const createDoc = {
    title: t("EmptyView:CreateDocument"),
    description: t("EmptyView:CreateDocumentDescription"),
    icon: <CreateNewFormIcon />,
    key: "create-doc-option",
    onClick: () => actions.onCreate("docx"),
    disabled: !security?.Create,
  };
  const createSpreadsheet = {
    title: t("EmptyView:CreateSpreadsheet"),
    description: t("EmptyView:CreateSpreadsheetDescription"),
    icon: <CreateNewSpreadsheetIcon />,
    key: "create-spreadsheet-option",
    onClick: () => actions.onCreate("xlsx"),
    disabled: !security?.Create,
  };
  const createPresentation = {
    title: t("EmptyView:CreatePresentation"),
    description: t("EmptyView:CreatePresentationDescription"),
    icon: <CreateNewPresentation />,
    key: "create-presentation-option",
    onClick: () => actions.onCreate("pptx"),
    disabled: !security?.Create,
  };

  const createForm = {
    title: t("EmptyView:CreateForm"),
    description: t("EmptyView:CreateFormDescription"),
    icon: <CreatePDFFormIcon />,
    key: "create-form-option",
    onClick: () => actions.onCreate("pdf", undefined, t),
    disabled: !security?.Create,
  };

  const createRoom = {
    title: t("EmptyView:CreateRoomTitleOption"),
    description: t("EmptyView:CreateRoomDescriotionOption"),
    icon: <CreateRoom />,
    key: "create-room",
    onClick: actions.onCreateRoom,
    disabled: false,
  };

  const inviteRootRoom = {
    title: t("EmptyView:InviteNewUsers"),
    description: t("EmptyView:InviteRootRoomDescription", {
      productName: t("Common:ProductName"),
    }),
    icon: <InviteUserFormIcon />,
    key: "invite-root-room",
    onClick: () => actions.inviteRootUser(EmployeeType.User),
    disabled: false,
  };

  const uploadFromDeviceAnyFile = isMobile
    ? createUploadFromDeviceOption(
        t("EmptyView:UploadDeviceOptionTitle"),
        t("EmptyView:UploadDeviceOptionDescription"),
        "file",
      )
    : {
        title: t("EmptyView:UploadDeviceOptionTitle"),
        description: t("EmptyView:UploadDeviceOptionDescription"),
        icon: <UploadDevicePDFFormIcon />,
        key: "uploads",
        disabled: !security?.Create,
        model: [
          {
            key: "upload-files",
            label: t("Common:Files"),
            icon: FormBlankIcon,
            onClick: () => actions.onUploadAction("file"),
          },
          {
            key: "upload-folder",
            label: t("Common:Folder"),
            icon: FolderReactSvgUrl,
            onClick: () => actions.onUploadAction("folder"),
          },
        ],
      };

  const migrationData = {
    title: t("EmptyView:MigrationDataTitle"),
    description: t("EmptyView:MigrationDataDescription", {
      productName: t("Common:ProductName"),
      organizationName: logoText,
    }),
    icon: <InviteUserFormIcon />,
    key: "migration-data",
    onClick: () => actions.navigate("/portal-settings/data-import"),
    disabled: false,
  };

  const createFile: EmptyViewItemType = {
    title: t("EmptyView:CreateNewFileTitle"),
    description: t("EmptyView:CreateNewFileDescription"),
    icon: <CreateNewFormIcon />,
    key: "create-form-form",
    disabled: !security?.Create,
    model: [
      {
        key: "create-Document",
        label: t("Common:Document"),
        icon: DocumentsReactSvgUrl,
        onClick: () => actions.onCreate("docx"),
      },
      {
        key: "create-spreadsheet",
        label: t("Common:Spreadsheet"),
        icon: SpreadsheetReactSvgUrl,
        onClick: () => actions.onCreate("xlsx"),
      },
      {
        key: "create-presentation",
        label: t("Common:Presentation"),
        icon: PresentationReactSvgUrl,
        onClick: () => actions.onCreate("pptx"),
      },
      {
        key: "create-pdf-form",
        label: t("Translations:NewForm"),
        icon: FormReactSvgUrl,
        onClick: () => actions.onCreate("pdf"),
      },
      { isSeparator: true, key: "separator" },
      {
        key: "create-folder",
        label: t("Common:Folder"),
        icon: FolderReactSvgUrl,
        onClick: () => actions.onCreate(undefined),
      },
    ],
  };

  if (isRootEmptyPage) {
    return match([rootFolderType, access, isVisitor])
      .returnType<EmptyViewOptionsType>()
      .with([FolderType.Rooms, ShareAccessRights.None, P._], () => [
        createRoom,
        inviteRootRoom,
        migrationData,
      ])
      .with([FolderType.USER, ShareAccessRights.None, P._], () => [
        createDoc,
        createSpreadsheet,
        createPresentation,
        createForm,
      ])
      .with([FolderType.Recent, P._, P._], () => [
        {
          ...actions.onGoToPersonal(),
          icon: <PersonIcon />,
          description: t("Files:GoToSection", {
            sectionName: t("Common:MyFilesSection"),
          }),
          key: "empty-view-goto-personal",
        },
      ])
      .with([FolderType.Archive, ShareAccessRights.None, P._], () => [
        {
          ...actions.onGoToShared(),
          icon: <FolderIcon />,
          description: t("Files:GoToMyRooms"),
          key: "empty-view-goto-shared",
        },
      ])
      .with([FolderType.TRASH, P._, P.when((item) => !item)], () => [
        {
          ...actions.onGoToPersonal(),
          icon: <PersonIcon />,
          description: t("Files:GoToSection", {
            sectionName: t("Common:MyFilesSection"),
          }),
          key: "empty-view-trash-goto-personal",
        },
      ])
      .otherwise(() => []);
  }

  if (isArchiveFolderRoot) return [];

  if (isAIRoom) {
    if (isKnowledgeTab) {
      const uploadFilesFromDocSpace = createUploadFromDocSpace(
        t("EmptyView:UploadFromPortalTitle", {
          productName: t("Common:ProductName"),
        }),
        t("EmptyView:SectionsUploadDescription", {
          sectionNameFirst: t("Common:MyFilesSection"),
          sectionNameSecond: t("Common:Rooms"),
        }),
        "",
        true,
      );

      const uploadFilesFromDevice = createUploadFromDeviceOption(
        t("EmptyView:UploadDeviceOptionTitle"),
        t("EmptyView:UploadDeviceOptionDescription"),
        "file",
      );

      return [uploadFilesFromDocSpace, uploadFilesFromDevice];
    }

    if (isResultsTab)
      return [
        {
          key: "open-chat",
          title: t("AIRoom:CreateChat"),
          icon: <CreateChatIcon />,
          onClick: () => {
            const filesFilter = FilesFilter.getFilter(window.location);

            filesFilter.searchArea = SearchArea.ResultStorage;

            const path = getCategoryUrl(CategoryType.Chat, filesFilter.folder);

            window.DocSpace.navigate(`${path}?${filesFilter.toUrlParams()}`);
          },
          description: t("AIRoom:CreateChatDescription"),
          disabled: false,
        },
      ];
  }

  if (isFolder) {
    return match([parentRoomType, folderType, access])
      .with(
        [
          P._,
          P.union(
            FolderType.Done,
            FolderType.InProgress,
            FolderType.SubFolderDone,
            FolderType.SubFolderInProgress,
          ),
          P._,
        ],
        () => [],
      )
      .with([FolderType.FormRoom, DefaultFolderType, P.when(isAdmin)], () => [
        uploadPDFFromDocSpace,
        uploadFromDevicePDF,
      ])
      .with([P._, DefaultFolderType, P.when(isAdmin)], () => [
        createDoc,
        createSpreadsheet,
        createPresentation,
        createForm,
      ])
      .otherwise(() => []);
  }

  switch (type) {
    case RoomsType.FormRoom:
      if (isFormFiller) return [];

      if (isCollaborator)
        return [uploadPDFFromDocSpace, uploadFromDevicePDF, shareFillingRoom];

      return [uploadPDFFromDocSpace, uploadFromDevicePDF, shareFillingRoom];
    case RoomsType.EditingRoom:
      if (isNotAdmin) return [];

      if (isCollaborator)
        return [createFile, uploadAllFromDocSpace, uploadFromDeviceAnyFile];

      return [
        createFile,
        inviteUser,
        uploadAllFromDocSpace,
        uploadFromDeviceAnyFile,
      ];
    case RoomsType.PublicRoom:
      if (isNotAdmin) return [];

      if (isCollaborator)
        return [createFile, uploadAllFromDocSpace, uploadFromDeviceAnyFile];

      return [
        createFile,
        sharePublicRoom,
        uploadAllFromDocSpace,
        uploadFromDeviceAnyFile,
      ];

    case RoomsType.VirtualDataRoom:
      if (isNotAdmin) return [];

      if (isCollaborator)
        return [createFile, uploadAllFromDocSpace, uploadFromDeviceAnyFile];

      return [
        createFile,
        inviteUser,
        uploadAllFromDocSpace,
        uploadFromDeviceAnyFile,
      ];

    case RoomsType.CustomRoom:
    case RoomsType.AIRoom:
      if (isNotAdmin) return [];

      if (isCollaborator)
        return [createFile, uploadAllFromDocSpace, uploadFromDeviceAnyFile];

      return [
        createFile,
        inviteUser,
        uploadAllFromDocSpace,
        uploadFromDeviceAnyFile,
      ];
    default:
      return [];
  }
};
