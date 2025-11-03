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

import { match, P } from "ts-pattern";

import InviteUserFormIcon from "PUBLIC_DIR/images/emptyview/invite.user.svg";
import UploadPDFFormIcon from "PUBLIC_DIR/images/emptyview/upload.pdf.form.svg";
import UploadDevicePDFFormIcon from "PUBLIC_DIR/images/emptyview/upload.device.pdf.form.svg";
import CreateNewFormIcon from "PUBLIC_DIR/images/emptyview/create.new.form.svg";

import EmptyRoomsRootDarkIcon from "PUBLIC_DIR/images/emptyview/empty.rooms.root.dark.svg";
import EmptyRoomsRootLightIcon from "PUBLIC_DIR/images/emptyview/empty.rooms.root.light.svg";

import EmptyRecentDarkIcon from "PUBLIC_DIR/images/emptyview/empty.recent.dark.svg";
import EmptyRecentLightIcon from "PUBLIC_DIR/images/emptyview/empty.recent.light.svg";
import EmptyTrashDarkIcon from "PUBLIC_DIR/images/emptyview/empty.trash.dark.svg";
import EmptyTrashLightIcon from "PUBLIC_DIR/images/emptyview/empty.trash.light.svg";

import EmptyFavoritesLightIcon from "PUBLIC_DIR/images/emptyview/empty.favorites.svg";
import EmptyFavoritesDarkIcon from "PUBLIC_DIR/images/emptyview/empty.favorites.dark.svg";

import EmptyShareLightIcon from "PUBLIC_DIR/images/emptyview/empty.share.svg";
import EmptyShareDarkIcon from "PUBLIC_DIR/images/emptyview/empty.share.dark.svg";

import EmptyArchiveDarkIcon from "PUBLIC_DIR/images/emptyview/empty.archive.dark.svg";
import EmptyArchiveLightIcon from "PUBLIC_DIR/images/emptyview/empty.archive.light.svg";

import EmptyArchiveUserDarkIcon from "PUBLIC_DIR/images/emptyview/empty.archive.user.dark.svg";
import EmptyArchiveUserLightIcon from "PUBLIC_DIR/images/emptyview/empty.archive.user.light.svg";

import EmptyRoomsRootUserDarkIcon from "PUBLIC_DIR/images/emptyview/empty.rooms.root.user.dark.svg";
import EmptyRoomsRootUserLightIcon from "PUBLIC_DIR/images/emptyview/empty.rooms.root.user.light.svg";

import EmptyFormRoomDarkIcon from "PUBLIC_DIR/images/emptyview/empty.form.room.dark.svg";
import EmptyFormRoomLightIcon from "PUBLIC_DIR/images/emptyview/empty.form.room.light.svg";
import EmptyFormRoomCollaboratorDarkIcon from "PUBLIC_DIR/images/emptyview/empty.form.room.collaborator.dark.svg";
import EmptyFormRoomCollaboratorLightIcon from "PUBLIC_DIR/images/emptyview/empty.form.room.collaborator.light.svg";
import EmptyFormRoomFillingDarkIcon from "PUBLIC_DIR/images/emptyview/empty.form.room.filling.dark.svg";
import EmptyFormRoomFillingLightIcon from "PUBLIC_DIR/images/emptyview/empty.form.room.filling.light.svg";

import EmptyCustomRoomDarkIcon from "PUBLIC_DIR/images/emptyview/empty.custom.room.dark.svg";
import EmptyCustomRoomLightIcon from "PUBLIC_DIR/images/emptyview/empty.custom.room.light.svg";
import EmptyCustomRoomCollaboratorDarkIcon from "PUBLIC_DIR/images/emptyview/empty.custom.room.collaborator.dark.svg";
import EmptyCustomRoomCollaboratorLightIcon from "PUBLIC_DIR/images/emptyview/empty.custom.room.collaborator.light.svg";

import EmptyPublicRoomDarkIcon from "PUBLIC_DIR/images/emptyview/empty.public.room.dark.svg";
import EmptyPublicRoomLightIcon from "PUBLIC_DIR/images/emptyview/empty.public.room.light.svg";
import EmptyPublicRoomCollaboratorDarkIcon from "PUBLIC_DIR/images/emptyview/empty.public.room.collaborator.dark.svg";
import EmptyPublicRoomCollaboratorLightIcon from "PUBLIC_DIR/images/emptyview/empty.public.room.collaborator.light.svg";

import EmptyCollaborationRoomDarkIcon from "PUBLIC_DIR/images/emptyview/empty.collaboration.room.dark.svg";
import EmptyCollaborationRoomLightIcon from "PUBLIC_DIR/images/emptyview/empty.collaboration.room.light.svg";
import EmptyCollaborationRoomCollaboratorDarkIcon from "PUBLIC_DIR/images/emptyview/empty.collaboration.room.collaborator.dark.svg";
import EmptyCollaborationRoomCollaboratorLightIcon from "PUBLIC_DIR/images/emptyview/empty.collaboration.room.collaborator.light.svg";

import EmptyVirtualDataRoomDarkIcon from "PUBLIC_DIR/images/emptyview/empty.virtual.data.room.dark.svg";
import EmptyVirtualDataRoomLightIcon from "PUBLIC_DIR/images/emptyview/empty.virtual.data.room.light.svg";
import EmptyVirtualDataRoomCollaboratorDarkIcon from "PUBLIC_DIR/images/emptyview/empty.virtual.data.room.collaborator.dark.svg";
import EmptyVirtualDataRoomCollaboratorLightIcon from "PUBLIC_DIR/images/emptyview/empty.virtual.data.room.collaborator.light.svg";

import FormDefaultFolderLight from "PUBLIC_DIR/images/emptyview/empty.form.default.folder.light.svg";
import FormDefaultFolderDark from "PUBLIC_DIR/images/emptyview/empty.form.default.folder.dark.svg";
import DefaultFolderDark from "PUBLIC_DIR/images/emptyview/empty.default.folder.dark.svg";
import DefaultFolderLight from "PUBLIC_DIR/images/emptyview/empty.default.folder.light.svg";
import DefaultFolderUserDark from "PUBLIC_DIR/images/emptyview/empty.default.folder.user.dark.svg";
import DefaultFolderUserLight from "PUBLIC_DIR/images/emptyview/empty.default.folder.user.light.svg";

import EmptyAIAgentsDarkIcon from "PUBLIC_DIR/images/emptyview/empty.ai-agents.icon.dark.svg";
import EmptyAIAgentsLightIcon from "PUBLIC_DIR/images/emptyview/empty.ai-agents.icon.light.svg";

import {
  FilesSelectorFilterTypes,
  FilterType,
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";

import type { Nullable, TTranslation } from "@docspace/shared/types";
import type { TFolderSecurity } from "@docspace/shared/api/files/types";
import type { TRoomSecurity } from "@docspace/shared/api/rooms/types";

import { DefaultFolderType } from "./EmptyViewContainer.constants";
import type {
  AccessType,
  ExtensionType,
  OptionActions,
  UploadType,
} from "./EmptyViewContainer.types";

export const isUser = (access: AccessType) => {
  return (
    access !== ShareAccessRights.None &&
    access !== ShareAccessRights.RoomManager &&
    access !== ShareAccessRights.Collaborator
  );
};

export const isAdmin = (access: AccessType) => {
  return !isUser(access);
};

export const getFolderDescription = (
  t: TTranslation,
  access: AccessType,
  isNotAdmin: boolean,
  isArchiveFolderRoot: boolean,
  folderType: Nullable<FolderType>,
  parentRoomType: Nullable<FolderType>,
) => {
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
    .with([FolderType.FormRoom, DefaultFolderType, P._], () =>
      t("EmptyView:FormFolderDefaultDescription", {
        productName: t("Common:ProductName"),
      }),
    )
    .with([P._, DefaultFolderType, P.when(isAdmin)], () =>
      t("EmptyView:DefaultFolderDescription"),
    )
    .with([P._, DefaultFolderType, P.when(isUser)], () =>
      t("Common:UserEmptyDescription"),
    )
    .otherwise(() => "");
};

export const getRoomDescription = (
  t: TTranslation,
  isNotAdmin: boolean,
  isArchiveFolderRoot: boolean,
) => {
  if (isNotAdmin || isArchiveFolderRoot)
    return t("Common:UserEmptyDescription");

  return t("EmptyView:EmptyDescription");
};

const getAIAgentsAIEnabledTitle = (t: TTranslation, access: AccessType) => {
  return isUser(access)
    ? t("EmptyView:EmptyAIAgentsUserTitle")
    : t("EmptyView:EmptyAIAgentsTitle");
};

const getAIAgentsAIDisabledTitle = (
  t: TTranslation,
  standalone: boolean,
  isDocSpaceAdmin: boolean,
) => {
  return match([standalone, isDocSpaceAdmin])
    .with([true, true], () =>
      t("Common:EmptyAIAgentsAIDisabledStandaloneAdminTitle"),
    )
    .with([false, true], () =>
      t("EmptyView:EmptyAIAgentsAIDisabledSaasAdminTitle"),
    )
    .otherwise(() => t("EmptyView:EmptyAIAgentsAIDisabledUserTitle"));
};

const getAIAgentsAIDisabledDescription = (
  t: TTranslation,
  standalone: boolean,
  isDocSpaceAdmin: boolean,
) => {
  return match([standalone, isDocSpaceAdmin])
    .with([true, true], () =>
      t("Common:EmptyAIAgentsAIDisabledStandaloneAdminDescription", {
        productName: t("Common:ProductName"),
      }),
    )
    .with([false, true], () =>
      t("EmptyView:EmptyAIAgentsAIDisabledSaasAdminDescription", {
        productName: t("Common:ProductName"),
      }),
    )
    .otherwise(() =>
      t("EmptyView:EmptyAIAgentsAIDisabledDescription", {
        productName: t("Common:ProductName"),
      }),
    );
};

const getAIAgentsAIEnabledDescription = (
  t: TTranslation,
  access: AccessType,
) => {
  return isUser(access)
    ? t("EmptyView:EmptyAIAgentsAIEnabledUserDescription")
    : t("EmptyView:EmptyAIAgentsDescription");
};

export const getRootDescription = (
  t: TTranslation,
  access: AccessType,
  rootFolderType: Nullable<FolderType>,
  isPublicRoom: boolean,
  security: Nullable<TFolderSecurity>,
  standalone: boolean,
  aiReady: boolean,
  isDocSpaceAdmin: boolean,
) => {
  return match([rootFolderType, access])
    .with(
      [FolderType.AIAgents, P._],
      () =>
        aiReady
          ? getAIAgentsAIEnabledDescription(t, access)
          : getAIAgentsAIDisabledDescription(t, true, isDocSpaceAdmin), // NOTE: AI SaaS same as AI Standalone in v.4.0
    )
    .with([FolderType.Rooms, ShareAccessRights.None], () =>
      t("Files:RoomEmptyContainerDescription"),
    )
    .with([FolderType.Rooms, ShareAccessRights.DenyAccess], () =>
      t("EmptyView:EmptyRootRoomUserDescription"),
    )
    .with([FolderType.RoomTemplates, P._], () =>
      t("EmptyView:EmptyTemplatesDescription"),
    )
    .with([FolderType.Rooms, P.when(() => isPublicRoom)], () => (
      <>
        <span>{t("Common:RoomEmptyAtTheMoment")}</span>
        <br />
        <span>{t("Common:FilesWillAppearHere")}</span>
      </>
    ))
    .with([FolderType.USER, P.when(() => security?.Create)], () =>
      t("EmptyView:DefaultFolderDescription"),
    )
    .with([FolderType.SHARE, P._], () =>
      t("EmptyView:EmptyShareDescription", {
        productName: t("Common:ProductName"),
      }),
    )
    .with([FolderType.Recent, P._], () => t("EmptyView:EmptyRecentDescription"))
    .with([FolderType.Favorites, P._], () =>
      t("EmptyView:EmptyFavoritesDescription"),
    )
    .with([FolderType.Archive, ShareAccessRights.None], () =>
      t("Files:ArchiveEmptyScreen", {
        productName: t("Common:ProductName"),
      }),
    )
    .with([FolderType.Archive, ShareAccessRights.DenyAccess], () =>
      t("Files:ArchiveEmptyScreenUser"),
    )
    .with([FolderType.TRASH, P._], () =>
      t("Files:TrashFunctionalityDescription", {
        sectionName: t("Common:TrashSection"),
      }),
    )
    .otherwise(() => "");
};

export const getFolderTitle = (
  t: TTranslation,
  isArchiveFolderRoot: boolean,
  isNotAdmin: boolean,
  access: AccessType,
  folderType: Nullable<FolderType>,
  parentRoomType: Nullable<FolderType>,
) => {
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
        DefaultFolderType,
        P.when(() => isNotAdmin || isArchiveFolderRoot),
      ],
      () => t("EmptyView:FormFolderDefaultUserTitle"),
    )
    .with([FolderType.FormRoom, DefaultFolderType, P._], () =>
      t("EmptyView:FormFolderDefaultTitle"),
    )
    .with([P._, DefaultFolderType, P._], () => t("Common:EmptyScreenFolder"))
    .otherwise(() => "");
};

export const getRoomTitle = (
  t: TTranslation,
  type: RoomsType,
  access: AccessType,
  isNotAdmin: boolean,
  isArchiveFolderRoot: boolean,
) => {
  const isCollaborator = access === ShareAccessRights.Collaborator;

  if (isCollaborator) return t("EmptyView:CollaboratorEmptyTitle");

  if (isNotAdmin || isArchiveFolderRoot) return t("Common:EmptyScreenFolder");

  switch (type) {
    case RoomsType.FormRoom:
      return t("EmptyView:FormRoomEmptyTitle");
    case RoomsType.EditingRoom:
      return t("EmptyView:CollaborationRoomEmptyTitle");
    case RoomsType.PublicRoom:
      return t("EmptyView:PublicRoomEmptyTitle");
    case RoomsType.VirtualDataRoom:
      return t("EmptyView:VirtualDataRoomEmptyTitle");
    case RoomsType.CustomRoom:
      return t("EmptyView:CustomRoomEmptyTitle");
    default:
      return "";
  }
};

export const getRootTitle = (
  t: TTranslation,
  access: AccessType,
  rootFolderType: Nullable<FolderType>,
  aiReady: boolean,
  standalone: boolean,
  isDocSpaceAdmin: boolean,
) => {
  return match([rootFolderType, access])
    .with(
      [FolderType.AIAgents, P._],
      () =>
        aiReady
          ? getAIAgentsAIEnabledTitle(t, access)
          : getAIAgentsAIDisabledTitle(t, true, isDocSpaceAdmin), // NOTE: AI SaaS same as AI Standalone in v.4.0
    )
    .with(
      [
        FolderType.Rooms,
        P.union(
          ShareAccessRights.None,
          ShareAccessRights.Comment,
          ShareAccessRights.Review,
          ShareAccessRights.Editing,
          ShareAccessRights.ReadOnly,
        ),
      ],
      () =>
        t("Common:EmptyRootRoomHeader", {
          productName: t("Common:ProductName"),
        }),
    )
    .with([FolderType.Rooms, ShareAccessRights.DenyAccess], () =>
      t("EmptyView:EmptyRootRoomUserTitle"),
    )
    .with([FolderType.RoomTemplates, P._], () =>
      t("EmptyView:EmptyTemplatesTitle"),
    )
    .with([FolderType.USER, ShareAccessRights.None], () =>
      t("Common:EmptyScreenFolder"),
    )
    .with([FolderType.SHARE, P._], () => t("EmptyView:EmptyShareTitle"))
    .with([FolderType.Favorites, P._], () => t("EmptyView:EmptyFavoritesTitle"))
    .with([FolderType.Recent, P._], () => t("EmptyView:NoRecentFilesHereYet"))
    .with([FolderType.Archive, P._], () => t("Files:ArchiveEmptyScreenHeader"))
    .with([FolderType.TRASH, P._], () => t("Common:EmptyScreenFolder"))
    .otherwise(() => "");
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
    .with([P._, DefaultFolderType, P.when(isUser)], () =>
      isBaseTheme ? <DefaultFolderUserLight /> : <DefaultFolderUserDark />,
    )
    .with([P._, DefaultFolderType, P.when(isAdmin)], () =>
      isBaseTheme ? <DefaultFolderLight /> : <DefaultFolderDark />,
    )
    .otherwise(() => <div />);
};

export const getRoomIcon = (
  type: RoomsType,
  isBaseTheme: boolean,
  access: AccessType,
) => {
  return match([type, access])
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
    .with(
      [
        RoomsType.EditingRoom,
        P.union(ShareAccessRights.None, ShareAccessRights.RoomManager),
      ],
      () =>
        isBaseTheme ? (
          <EmptyCollaborationRoomLightIcon />
        ) : (
          <EmptyCollaborationRoomDarkIcon />
        ),
    )
    .with([RoomsType.EditingRoom, ShareAccessRights.Collaborator], () =>
      isBaseTheme ? (
        <EmptyCollaborationRoomCollaboratorLightIcon />
      ) : (
        <EmptyCollaborationRoomCollaboratorDarkIcon />
      ),
    )
    .with(
      [
        RoomsType.PublicRoom,
        P.union(ShareAccessRights.None, ShareAccessRights.RoomManager), // owner, docspace admin, room admin
      ],
      () =>
        isBaseTheme ? (
          <EmptyPublicRoomLightIcon />
        ) : (
          <EmptyPublicRoomDarkIcon />
        ),
    )
    .with([RoomsType.PublicRoom, ShareAccessRights.Collaborator], () =>
      isBaseTheme ? (
        <EmptyPublicRoomCollaboratorLightIcon />
      ) : (
        <EmptyPublicRoomCollaboratorDarkIcon />
      ),
    )
    .with(
      [
        RoomsType.VirtualDataRoom,
        P.union(ShareAccessRights.None, ShareAccessRights.RoomManager), // owner, docspace admin, room admin
      ],
      () =>
        isBaseTheme ? (
          <EmptyVirtualDataRoomLightIcon />
        ) : (
          <EmptyVirtualDataRoomDarkIcon />
        ),
    )
    .with([RoomsType.VirtualDataRoom, ShareAccessRights.Collaborator], () =>
      isBaseTheme ? (
        <EmptyVirtualDataRoomCollaboratorLightIcon />
      ) : (
        <EmptyVirtualDataRoomCollaboratorDarkIcon />
      ),
    )
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
    .with(
      [
        RoomsType.VirtualDataRoom,
        P.union(ShareAccessRights.None, ShareAccessRights.RoomManager), // owner, docspace admin, room admin
      ],
      () =>
        isBaseTheme ? (
          <EmptyVirtualDataRoomLightIcon />
        ) : (
          <EmptyVirtualDataRoomDarkIcon />
        ),
    )
    .with([RoomsType.VirtualDataRoom, ShareAccessRights.Collaborator], () =>
      isBaseTheme ? (
        <EmptyVirtualDataRoomCollaboratorLightIcon />
      ) : (
        <EmptyVirtualDataRoomCollaboratorDarkIcon />
      ),
    )
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
    .with(
      [
        RoomsType.AIRoom,
        P.union(ShareAccessRights.None, ShareAccessRights.RoomManager), // owner, docspace admin, room admin
      ],
      () =>
        isBaseTheme ? (
          <EmptyCustomRoomLightIcon />
        ) : (
          <EmptyCustomRoomDarkIcon />
        ),
    )
    .with([RoomsType.AIRoom, ShareAccessRights.Collaborator], () =>
      isBaseTheme ? (
        <EmptyCustomRoomCollaboratorLightIcon />
      ) : (
        <EmptyCustomRoomCollaboratorDarkIcon />
      ),
    )
    .with([P._, P.when(isUser)], () =>
      isBaseTheme ? <DefaultFolderUserLight /> : <DefaultFolderUserDark />,
    )
    .otherwise(() => null);
};

export const getRootIcon = (
  rootFolderType: Nullable<FolderType>,
  access: AccessType,
  isBaseTheme: boolean,
) => {
  return match([rootFolderType, access])
    .with([FolderType.AIAgents, P._], () =>
      isBaseTheme ? <EmptyAIAgentsLightIcon /> : <EmptyAIAgentsDarkIcon />,
    )
    .with([FolderType.Rooms, ShareAccessRights.None], () =>
      isBaseTheme ? <EmptyRoomsRootLightIcon /> : <EmptyRoomsRootDarkIcon />,
    )
    .with(
      [
        FolderType.Rooms,
        P.union(
          ShareAccessRights.DenyAccess,
          ShareAccessRights.None,
          ShareAccessRights.Comment,
          ShareAccessRights.Review,
          ShareAccessRights.Editing,
          ShareAccessRights.ReadOnly,
        ),
      ],
      () =>
        isBaseTheme ? (
          <EmptyRoomsRootUserLightIcon />
        ) : (
          <EmptyRoomsRootUserDarkIcon />
        ),
    )
    .with([FolderType.RoomTemplates, P._], () =>
      isBaseTheme ? (
        <EmptyRoomsRootUserLightIcon />
      ) : (
        <EmptyRoomsRootUserDarkIcon />
      ),
    )
    .with([FolderType.USER, ShareAccessRights.None], () =>
      isBaseTheme ? <DefaultFolderLight /> : <DefaultFolderDark />,
    )
    .with([FolderType.Recent, P._], () =>
      isBaseTheme ? <EmptyRecentLightIcon /> : <EmptyRecentDarkIcon />,
    )
    .with([FolderType.Favorites, P._], () =>
      isBaseTheme ? <EmptyFavoritesLightIcon /> : <EmptyFavoritesDarkIcon />,
    )
    .with([FolderType.SHARE, P._], () =>
      isBaseTheme ? <EmptyShareLightIcon /> : <EmptyShareDarkIcon />,
    )
    .with([FolderType.Archive, ShareAccessRights.None], () =>
      isBaseTheme ? <EmptyArchiveLightIcon /> : <EmptyArchiveDarkIcon />,
    )
    .with([FolderType.Archive, ShareAccessRights.DenyAccess], () =>
      isBaseTheme ? (
        <EmptyArchiveUserLightIcon />
      ) : (
        <EmptyArchiveUserDarkIcon />
      ),
    )
    .with([FolderType.TRASH, P._], () =>
      isBaseTheme ? <EmptyTrashLightIcon /> : <EmptyTrashDarkIcon />,
    )
    .otherwise(() => <div />);
};

export const helperOptions = (
  actions: OptionActions,
  security: Nullable<TFolderSecurity | TRoomSecurity>,
  isFrame?: boolean,
) => {
  const createInviteOption = (title: string, description: string) => {
    return {
      title,
      description,
      icon: <InviteUserFormIcon />,
      key: "invite-users",
      onClick: actions.inviteUser,
      disabled: !security?.EditAccess || isFrame,
    };
  };

  const createTemplateAccessOption = (title: string, description: string) => {
    return {
      title,
      description,
      icon: <InviteUserFormIcon />,
      key: "template-access",
      onClick: actions.onOpenAccessSettings,
      disabled: !security?.EditAccess || isFrame,
    };
  };

  const createCreateFileOption = (
    title: string,
    description: string,
    extension: ExtensionType,
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
    filterType: FilesSelectorFilterTypes | FilterType | string,
    isKnowledge?: boolean,
  ) => ({
    title,
    description,
    icon: <UploadPDFFormIcon />,
    key: "upload-pdf-form",
    onClick: () =>
      isKnowledge
        ? actions.uploadFromDocspaceAiKnowledge()
        : actions.uploadFromDocspace(filterType),
    disabled: !security?.Create,
  });

  return {
    createInviteOption,
    createTemplateAccessOption,
    createCreateFileOption,
    createUploadFromDocSpace,
    createUploadFromDeviceOption,
  };
};
