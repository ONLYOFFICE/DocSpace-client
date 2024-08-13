import React from "react";
import { P, match } from "ts-pattern";

import {
  FilesSelectorFilterTypes,
  FilterType,
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";

import EmptyFormRoomDarkIcon from "PUBLIC_DIR/images/emptyview/empty.form.room.dark.svg";
import EmptyFormRoomLightIcon from "PUBLIC_DIR/images/emptyview/empty.form.room.light.svg";

import EmptyCustomRoomDarkIcon from "PUBLIC_DIR/images/emptyview/empty.custom.room.dark.svg";
import EmptyCustomRoomLightIcon from "PUBLIC_DIR/images/emptyview/empty.custom.room.light.svg";

import EmptyFormRoomCollaboratorDarkIcon from "PUBLIC_DIR/images/emptyview/empty.form.room.collaborator.dark.svg";
import EmptyFormRoomCollaboratorLightIcon from "PUBLIC_DIR/images/emptyview/empty.form.room.collaborator.light.svg";

import EmptyCustomRoomCollaboratorDarkIcon from "PUBLIC_DIR/images/emptyview/empty.custom.room.collaborator.dark.svg";
import EmptyCustomRoomCollaboratorLightIcon from "PUBLIC_DIR/images/emptyview/empty.custom.room.collaborator.light.svg";

import EmptyCustomRoomOtherDarkIcon from "PUBLIC_DIR/images/emptyview/empty.custom.room.other.dark.svg";
import EmptyCustomRoomOtherLightIcon from "PUBLIC_DIR/images/emptyview/empty.custom.room.other.light.svg";

import EmptyFormRoomFillingDarkIcon from "PUBLIC_DIR/images/emptyview/empty.form.room.filling.dark.svg";
import EmptyFormRoomFillingLightIcon from "PUBLIC_DIR/images/emptyview/empty.form.room.filling.light.svg";

import CreateNewFormIcon from "PUBLIC_DIR/images/emptyview/create.new.form.svg";
// import CreateFromFormIcon from "PUBLIC_DIR/images/emptyview/create.from.document.form.svg";
import InviteUserFormIcon from "PUBLIC_DIR/images/emptyview/invite.user.svg";
import UploadPDFFormIcon from "PUBLIC_DIR/images/emptyview/upload.pdf.form.svg";
import UploadDevicePDFFormIcon from "PUBLIC_DIR/images/emptyview/upload.device.pdf.form.svg";
import SharedIcon from "PUBLIC_DIR/images/emptyview/share.svg";

import DocumentsReactSvgUrl from "PUBLIC_DIR/images/actions.documents.react.svg?url";
import SpreadsheetReactSvgUrl from "PUBLIC_DIR/images/spreadsheet.react.svg?url";
import PresentationReactSvgUrl from "PUBLIC_DIR/images/actions.presentation.react.svg?url";
import FormReactSvgUrl from "PUBLIC_DIR/images/access.form.react.svg?url";
import FolderReactSvgUrl from "PUBLIC_DIR/images/catalog.folder.react.svg?url";

import FormDefaultFolderLight from "PUBLIC_DIR/images/emptyview/empty.form.default.folder.light.svg";
import FormDefaultFolderDark from "PUBLIC_DIR/images/emptyview/empty.form.default.folder.dark.svg";

import type { Nullable, TTranslation } from "@docspace/shared/types";
import type { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import type { TFolderSecurity } from "@docspace/shared/api/files/types";
import type { EmptyViewItemType } from "@docspace/shared/components/empty-view";

import type {
  ExtensiontionType,
  OptionActions,
  UploadType,
} from "./EmptyViewContainer.types";

type AccessType = Nullable<ShareAccessRights> | undefined;

export const getDescription = (
  type: RoomsType,
  t: TTranslation,
  access: AccessType,
  isFolder: boolean,
  folderType: Nullable<FolderType>,
  parentRoomType: Nullable<FolderType>,
  isArchiveFolderRoot: boolean,
): string => {
  const isCollaborator = access === ShareAccessRights.Collaborator;

  const isNotAdmin =
    access !== ShareAccessRights.None &&
    access !== ShareAccessRights.RoomManager &&
    !isCollaborator;

  if (isFolder) {
    return match([parentRoomType, folderType, access])
      .with([P._, FolderType.Done, P._], () =>
        t("Files:EmptyFormFolderDoneDescriptionText"),
      )
      .with([P._, FolderType.InProgress, P._], () =>
        t("Files:EmptyFormFolderProgressDescriptionText"),
      )
      .with([P._, FolderType.SubFolderDone, P._], () =>
        t("Files:EmptyFormSubFolderDoneDescriptionText"),
      )
      .with([P._, FolderType.SubFolderInProgress, P._], () =>
        t("Files:EmptyFormSubFolderProgressDescriptionText"),
      )
      .with(
        [
          FolderType.FormRoom,
          null,
          P.when(() => isNotAdmin || isArchiveFolderRoot),
        ],
        () => t("EmptyView:FormFolderDefaultUserDescription"),
      )
      .with([FolderType.FormRoom, null, P._], () =>
        t("EmptyView:FormFolderDefaultDescription", {
          productName: t("Common:ProductName"),
        }),
      )
      .otherwise(() => "");
  }

  if (isNotAdmin || isArchiveFolderRoot)
    return t("EmptyView:UserEmptyDescription");

  return t("EmptyView:EmptyDescription");
};

export const getTitle = (
  type: RoomsType,
  t: TTranslation,
  access: AccessType,
  isFolder: boolean,
  folderType: Nullable<FolderType>,
  parentRoomType: Nullable<FolderType>,
  isArchiveFolderRoot: boolean,
): string => {
  const isCollaborator = access === ShareAccessRights.Collaborator;

  const isNotAdmin =
    access !== ShareAccessRights.None &&
    access !== ShareAccessRights.RoomManager &&
    !isCollaborator;

  if (isFolder) {
    return match([parentRoomType, folderType, access])
      .with([P._, FolderType.Done, P._], () =>
        t("Files:EmptyFormFolderDoneHeaderText"),
      )

      .with([P._, FolderType.InProgress, P._], () =>
        t("Files:EmptyFormFolderProgressHeaderText"),
      )
      .with(
        [
          P._,
          P.union(FolderType.SubFolderDone, FolderType.SubFolderInProgress),
          P._,
        ],
        () => t("Files:EmptyFormSubFolderHeaderText"),
      )
      .with(
        [
          FolderType.FormRoom,
          null,
          P.when(() => isNotAdmin || isArchiveFolderRoot),
        ],
        () => t("EmptyView:FormFolderDefaultUserTitle"),
      )
      .with([FolderType.FormRoom, null, P._], () =>
        t("EmptyView:FormFolderDefaultTitle"),
      )
      .otherwise(() => "");
  }

  if (isCollaborator) return t("EmptyView:CollaboratorEmptyTitle");

  if (isNotAdmin || isArchiveFolderRoot) return t("Files:EmptyScreenFolder");

  switch (type) {
    case RoomsType.FormRoom:
      return t("EmptyView:FormRoomEmptyTitle");
    case RoomsType.EditingRoom:
      return "";
    case RoomsType.PublicRoom:
      return "";
    case RoomsType.CustomRoom:
      return t("EmptyView:CustomRoomEmptyTitle");
    default:
      return "";
  }
};

export const getFolderIcon = (
  roomType: Nullable<FolderType>,
  isBaseTheme: boolean,
  access: AccessType,
  folderType: Nullable<FolderType>,
) => {
  return match([roomType, folderType, access])
    .with([FolderType.FormRoom, P._, P._], () =>
      isBaseTheme ? <FormDefaultFolderLight /> : <FormDefaultFolderDark />,
    )
    .otherwise(() => <div />);
};

export const getRoomIcon = (
  type: RoomsType,
  isBaseTheme: boolean,
  access: AccessType,
) => {
  return (
    match([type, access])
      .with([RoomsType.FormRoom, ShareAccessRights.FormFilling], () =>
        isBaseTheme ? (
          <EmptyFormRoomFillingLightIcon />
        ) : (
          <EmptyFormRoomFillingDarkIcon />
        ),
      )
      .with([RoomsType.FormRoom, ShareAccessRights.Collaborator], () =>
        isBaseTheme ? (
          <EmptyFormRoomCollaboratorLightIcon />
        ) : (
          <EmptyFormRoomCollaboratorDarkIcon />
        ),
      )
      .with([RoomsType.FormRoom, P._], () =>
        isBaseTheme ? <EmptyFormRoomLightIcon /> : <EmptyFormRoomDarkIcon />,
      )

      .with([RoomsType.EditingRoom, P._], () => <div />)
      .with([RoomsType.PublicRoom, P._], () => <div />)
      .with(
        [
          RoomsType.CustomRoom,
          P.union(ShareAccessRights.None, ShareAccessRights.RoomManager), // owner, docspace admin, room admin
        ],
        () =>
          isBaseTheme ? (
            <EmptyCustomRoomLightIcon />
          ) : (
            <EmptyCustomRoomDarkIcon />
          ),
      )
      .with([RoomsType.CustomRoom, ShareAccessRights.Collaborator], () =>
        isBaseTheme ? (
          <EmptyCustomRoomCollaboratorLightIcon />
        ) : (
          <EmptyCustomRoomCollaboratorDarkIcon />
        ),
      )
      .with([RoomsType.CustomRoom, P._], () =>
        isBaseTheme ? (
          <EmptyCustomRoomOtherLightIcon />
        ) : (
          <EmptyCustomRoomOtherDarkIcon />
        ),
      )
      // eslint-disable-next-line react/jsx-no-useless-fragment
      .otherwise(() => <></>)
  );
};

export const getIcon = (
  type: RoomsType,
  isBaseTheme: boolean,
  access: AccessType,
  isFolder: boolean,
  folderType: Nullable<FolderType>,
  parentRoomType: Nullable<FolderType>,
): JSX.Element => {
  return isFolder
    ? getFolderIcon(parentRoomType, isBaseTheme, access, folderType)
    : getRoomIcon(type, isBaseTheme, access);
};

const helperOptions = (
  actions: OptionActions,
  security: Nullable<TFolderSecurity | TRoomSecurity>,
) => {
  const createInviteOption = (title: string, description: string) => {
    return {
      title,
      description,
      icon: <InviteUserFormIcon />,
      key: "invite-users",
      onClick: actions.inviteUser,
      disabled: !security?.EditAccess,
    };
  };

  const createCreateFileOption = (
    title: string,
    description: string,
    extension: ExtensiontionType,
    withoutDialog: boolean = false,
  ) => ({
    title,
    description,
    icon: <CreateNewFormIcon />,
    key: "create-form",
    onClick: () => actions.onCreate(extension, withoutDialog),
    disabled: !security?.Create,
  });

  const createUploadFromDeviceOption = (
    title: string,
    description: string,
    uploadType: UploadType,
  ) => ({
    title,
    description,
    icon: <UploadDevicePDFFormIcon />,
    key: "create-form",
    onClick: () => actions.onUploadAction(uploadType),
    disabled: !security?.Create,
  });

  const createUploadFromDocSpace = (
    title: string,
    description: string,
    filterType: FilesSelectorFilterTypes | FilterType,
  ) => ({
    title,
    description,
    icon: <UploadPDFFormIcon />,
    key: "upload-pdf-form",
    onClick: () => actions.uploadFromDocspace(filterType),
    disabled: !security?.Create,
  });

  return {
    createInviteOption,
    createCreateFileOption,
    createUploadFromDocSpace,
    createUploadFromDeviceOption,
  };
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
  actions: OptionActions,
): EmptyViewItemType[] => {
  const isFormFiller = access === ShareAccessRights.FormFilling;
  const isCollaborator = access === ShareAccessRights.Collaborator;

  const isNotAdmin =
    access !== ShareAccessRights.None &&
    access !== ShareAccessRights.RoomManager &&
    !isCollaborator;

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
    t("EmptyView:UploadPDFFormOptionDescription", {
      productName: t("Common:ProductName"),
    }),
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

  const shareRoom = {
    title: t("EmptyView:ShareOptionTitle"),
    description: t("EmptyView:ShareOptionDescription"),
    icon: <SharedIcon />,
    key: "share-room",
    onClick: actions.createAndCopySharedLink,
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
      .with([FolderType.FormRoom, null, P.when(() => isNotAdmin)], () => [])
      .with([FolderType.FormRoom, null, P._], () => [
        uploadPDFFromDocSpace,
        uploadFromDevicePDF,
      ])
      .otherwise(() => []);
  }

  switch (type) {
    case RoomsType.FormRoom:
      if (isFormFiller) return [];

      if (isCollaborator)
        return [uploadPDFFromDocSpace, uploadFromDevicePDF, shareRoom];

      return [uploadPDFFromDocSpace, uploadFromDevicePDF, shareRoom];
    case RoomsType.EditingRoom:
      return [];
    case RoomsType.PublicRoom:
      return [];
    case RoomsType.CustomRoom:
      if (isNotAdmin) return [];

      if (isCollaborator) return [createFile, uploadFromDeviceAnyFile];

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
