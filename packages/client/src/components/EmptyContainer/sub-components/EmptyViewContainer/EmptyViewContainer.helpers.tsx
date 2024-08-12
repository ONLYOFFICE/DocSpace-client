import React from "react";
import { P, match } from "ts-pattern";

import {
  EmployeeType,
  FilesSelectorFilterTypes,
  FilterType,
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";

import CreateNewFormIcon from "PUBLIC_DIR/images/emptyview/create.new.form.svg";
import CreateNewSpreadsheetIcon from "PUBLIC_DIR/images/emptyview/create.new.spreadsheet.svg";
import CreateNewPresentation from "PUBLIC_DIR/images/emptyview/create.new.presentation.svg";
import CreateRoom from "PUBLIC_DIR/images/emptyview/create.room.svg";
import InviteUserFormIcon from "PUBLIC_DIR/images/emptyview/invite.user.svg";
import PersonIcon from "PUBLIC_DIR/images/icons/12/person.svg";

import SharedIcon from "PUBLIC_DIR/images/emptyview/share.svg";

import DocumentsReactSvgUrl from "PUBLIC_DIR/images/actions.documents.react.svg?url";
import SpreadsheetReactSvgUrl from "PUBLIC_DIR/images/spreadsheet.react.svg?url";
import PresentationReactSvgUrl from "PUBLIC_DIR/images/actions.presentation.react.svg?url";
import FormReactSvgUrl from "PUBLIC_DIR/images/access.form.react.svg?url";
import FolderReactSvgUrl from "PUBLIC_DIR/images/catalog.folder.react.svg?url";

import type { Nullable, TTranslation } from "@docspace/shared/types";
import type { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import type { TFolderSecurity } from "@docspace/shared/api/files/types";
import type {
  EmptyViewItemType,
  EmptyViewOptionsType,
} from "@docspace/shared/components/empty-view";

import type { AccessType, OptionActions } from "./EmptyViewContainer.types";
import { DefaultFolderType } from "./EmptyViewContainer.constants";
import {
  getFolderDescription,
  getFolderIcon,
  getFolderTitle,
  getRoomDescription,
  getRoomIcon,
  getRoomTitle,
  getRootDesctiption,
  getRootIcom,
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
): string => {
  const isNotAdmin = isUser(access);

  if (isRootEmptyPage) return getRootDesctiption(t, access, rootFolderType);

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
): string => {
  const isNotAdmin = isUser(access);

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
  if (isRootEmptyPage) return getRootIcom(rootFolderType, access, isBaseTheme);

  return isFolder
    ? getFolderIcon(parentRoomType, isBaseTheme, access, folderType)
    : getRoomIcon(type, isBaseTheme, access);
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
): EmptyViewOptionsType => {
  const isFormFiller = access === ShareAccessRights.FormFilling;
  const isCollaborator = access === ShareAccessRights.Collaborator;

  const isNotAdmin = isUser(access);

  const {
    createInviteOption,
    // createCreateFileOption,
    createUploadFromDocSpace,
    createUploadFromDeviceOption,
  } = helperOptions(actions, security);

  const uploadPDFFromDocSpace = createUploadFromDocSpace(
    t("EmptyView:UploadFromPortalTitle", {
      productName: t("Common:ProductName"),
    }),
    t("EmptyView:UploadPDFFormOptionDescription"),
    FilterType.PDFForm,
  );

  const uploadAllFromDocSpace = createUploadFromDocSpace(
    t("EmptyView:UploadFromPortalTitle", {
      productName: t("Common:ProductName"),
    }),
    t("EmptyView:UploadFromPortalDescription"),
    // TODO: need fix selector
    FilesSelectorFilterTypes.ALL,
  );

  const uploadFromDevicePDF = createUploadFromDeviceOption(
    t("EmptyView:UploadDevicePDFFormOptionTitle"),
    t("EmptyView:UploadDevicePDFFormOptionDescription"),
    "pdf",
  );
  const uploadFromDeviceAnyFile = createUploadFromDeviceOption(
    t("EmptyView:UploadDeviceOptionTitle"),
    t("EmptyView:UploadDeviceOptionDescription"),
    "file",
  );

  const inviteUser = createInviteOption(
    t("EmptyView:InviteUsersOptionTitle"),
    t("EmptyView:InviteUsersOptionDescription"),
  );

  const inviteUserEditingRoom = createInviteOption(
    t("EmptyView:InviteUsersOptionTitle"),
    t("EmptyView:InviteUsersCollaborationOptionDescription"),
  );

  const shareFillingRoom = {
    title: t("EmptyView:ShareOptionTitle"),
    description: t("EmptyView:ShareOptionDescription"),
    icon: <SharedIcon />,
    key: "share-room",
    onClick: actions.createAndCopySharedLink,
    disabled: false,
  };

  const sharePublicRoom = {
    title: t("EmptyView:SharePublicRoomOptionTitle"),
    description: t("EmptyView:SharePublicRoomOptionDescription"),
    icon: <SharedIcon />,
    key: "share-public-room",
    onClick: actions.openInfoPanel,
    disabled: false,
  };

  const createDoc = {
    title: t("EmptyView:CreateDocument"),
    description: t("EmptyView:CreateDocumentDescription"),
    icon: <CreateNewFormIcon />,
    key: "create-doc-option",
    onClick: () => actions.onCreate("docx"),
    disabled: false,
  };
  const createSpreadsheet = {
    title: t("EmptyView:CreateSpreadsheet"),
    description: t("EmptyView:CreateSpreadsheetDescription"),
    icon: <CreateNewSpreadsheetIcon />,
    key: "create-spreadsheet-option",
    onClick: () => actions.onCreate("xlsx"),
    disabled: false,
  };
  const createPresentation = {
    title: t("EmptyView:CreatePresentation"),
    description: t("EmptyView:CreatePresentationDescription"),
    icon: <CreateNewPresentation />,
    key: "create-presentation-option",
    onClick: () => actions.onCreate("pptx"),
    disabled: false,
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
    onClick: () => actions.inviteRootUser(EmployeeType.Guest),
    disabled: false,
  };

  const migrationData = {
    title: t("EmptyView:MigrationDataTitle"),
    description: t("EmptyView:MigrationDataDescription", {
      productName: t("Common:ProductName"),
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
        label: t("Files:Document"),
        icon: DocumentsReactSvgUrl,
        onClick: () => actions.onCreate("docx"),
      },
      {
        key: "create-spreadsheet",
        label: t("Files:Spreadsheet"),
        icon: SpreadsheetReactSvgUrl,
        onClick: () => actions.onCreate("xlsx"),
      },
      {
        key: "create-presentation",
        label: t("Files:Presentation"),
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
        label: t("Files:Folder"),
        icon: FolderReactSvgUrl,
        onClick: () => actions.onCreate(undefined),
      },
    ],
  };

  if (isArchiveFolderRoot) return [];

  if (isRootEmptyPage) {
    return match([rootFolderType, access])
      .returnType<EmptyViewOptionsType>()
      .with([FolderType.Rooms, ShareAccessRights.None], () => [
        createRoom,
        inviteRootRoom,
        migrationData,
      ])
      .with([FolderType.USER, ShareAccessRights.None], () => [
        createDoc,
        createSpreadsheet,
        createPresentation,
      ])
      .with([FolderType.Recent, P._], () => ({
        ...actions.onGoToPersonal(),
        icon: <PersonIcon />,
        description: t("Files:GoToPersonal"),
      }))
      .otherwise(() => []);
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
        inviteUserEditingRoom,
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
    case RoomsType.CustomRoom:
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
