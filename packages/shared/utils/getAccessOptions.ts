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

import { globalColors } from "../themes";
import type { TTranslation } from "../types";
import { getUserTypeTranslation } from "./common";
import { RoomsType, EmployeeType, ShareAccessRights } from "../enums";

type AccessOptionType = {
  key: string | EmployeeType;
  label: string;
  description: string;
  access: ShareAccessRights | EmployeeType;
  type: EmployeeType;

  color?: string;
  quota?: string;
  tooltip?: string;
};

type SeparatorOptionType = {
  key: string;
  isSeparator: boolean;
};

const None = -1 as RoomsType;

const getRoomAdminDescription = (roomType: RoomsType, t: TTranslation) => {
  switch (roomType) {
    case RoomsType.FormRoom:
      return t("Common:RoleRoomAdminFormRoomDescription");
    case None:
      return t("Common:RoleRoomAdminDescription", {
        sectionName: t("Common:MyDocuments"),
      });
    default:
      return t("Common:RoleRoomManagerDescription");
  }
};

const getUserDescription = (roomType: RoomsType, t: TTranslation) => {
  switch (roomType) {
    case RoomsType.FormRoom:
      return t("Common:RolePowerUserFormRoomDescription");
    case None:
      return t("Common:RoleNewUserDescription");
    default:
      return t("Common:RoleContentCreatorDescription");
  }
};

const getFormFillerDescription = (roomType: RoomsType, t: TTranslation) => {
  switch (roomType) {
    case RoomsType.FormRoom:
      return t("Common:RoleFormFillerFormRoomDescription");
    default:
      return t("Common:RoleFormFillerDescription");
  }
};

export const getAccessOptions = (
  t: TTranslation,
  roomType: RoomsType = RoomsType.CustomRoom,
  withRemove = false,
  withSeparator = false,
  isOwner = false,
  isAdmin = false,
  standalone = false,
) => {
  let options: Array<AccessOptionType | SeparatorOptionType> = [];
  const accesses = {
    portalAdmin: {
      key: EmployeeType.Admin,
      label: getUserTypeTranslation(EmployeeType.Admin, t),
      description: t("Common:RolePortalAdminDescription", {
        productName: t("Common:ProductName"),
        sectionName: t("Common:MyDocuments"),
      }),
      ...(!standalone && { quota: t("Common:Paid") }),
      color: globalColors.favoritesStatus,
      access:
        roomType === None ? EmployeeType.Admin : ShareAccessRights.FullAccess,
      type: EmployeeType.Admin,
    },
    roomAdmin: {
      key: "roomAdmin",
      label: getUserTypeTranslation(EmployeeType.RoomAdmin, t),
      description: getRoomAdminDescription(roomType, t),
      ...(!standalone && { quota: t("Common:Paid") }),
      color: globalColors.favoritesStatus,
      access:
        roomType === None
          ? EmployeeType.RoomAdmin
          : ShareAccessRights.RoomManager,
      type: EmployeeType.RoomAdmin,
    },
    roomManager: {
      key: "roomManager",
      label: t("Common:RoomManager"),
      description: getRoomAdminDescription(roomType, t),
      tooltip: t("UserMaxAvailableRoleWarning", {
        productName: t("Common:ProductName"),
      }),
      ...(!standalone && { quota: t("Common:Paid") }),
      color: globalColors.favoritesStatus,
      access:
        roomType === None
          ? EmployeeType.RoomAdmin
          : ShareAccessRights.RoomManager,
      type: EmployeeType.RoomAdmin,
    },
    user: {
      key: "newUser",
      label: getUserTypeTranslation(EmployeeType.User, t),
      description: getUserDescription(roomType, t),
      access:
        roomType === None ? EmployeeType.User : ShareAccessRights.Collaborator,
      type: EmployeeType.User,
    },
    contentCreator: {
      key: "contentCreator",
      label: t("Common:ContentCreator"),
      description: getUserDescription(roomType, t),
      access:
        roomType === None ? EmployeeType.User : ShareAccessRights.Collaborator,
      type: EmployeeType.User,
    },
    editor: {
      key: "editor",
      label: t("Common:Editor"),
      description: t("Common:RoleEditorDescription"),
      access: ShareAccessRights.Editing,
      type: EmployeeType.User,
    },
    formFiller: {
      key: "formFiller",
      label: t("Common:RoleFormFiller"),
      description: getFormFillerDescription(roomType, t),
      access: ShareAccessRights.FormFilling,
      type: EmployeeType.User,
    },
    reviewer: {
      key: "reviewer",
      label: t("Common:RoleReviewer"),
      description: t("Common:RoleReviewerDescription"),
      access: ShareAccessRights.Review,
      type: EmployeeType.User,
    },
    commentator: {
      key: "commentator",
      label: t("Common:RoleCommentator"),
      description: t("Common:RoleCommentatorDescription"),
      access: ShareAccessRights.Comment,
      type: EmployeeType.User,
    },
    viewer: {
      key: "viewer",
      label: t("Common:RoleViewer"),
      description: t("Common:RoleViewerDescription"),
      access: ShareAccessRights.ReadOnly,
      type: EmployeeType.User,
    },
  };

  switch (roomType) {
    // case RoomsType.FillingFormsRoom:
    //   options = [
    //     accesses.roomManager,
    //     { key: "s1", isSeparator: withSeparator },
    //     accesses.contentCreator,
    //     accesses.formFiller,
    //     accesses.viewer,
    //   ];
    //   break;
    case RoomsType.EditingRoom:
      options = [
        accesses.roomManager,
        { key: "s1", isSeparator: withSeparator },
        accesses.contentCreator,
        accesses.editor,
        accesses.viewer,
      ];
      break;
    // case RoomsType.ReviewRoom:
    //   options = [
    //     accesses.roomManager,
    //     { key: "s1", isSeparator: withSeparator },
    //     accesses.contentCreator,
    //     accesses.reviewer,
    //     accesses.commentator,
    //     accesses.viewer,
    //   ];
    //   break;
    // case RoomsType.ReadOnlyRoom:
    //   options = [
    //     accesses.roomManager,
    //     { key: "s1", isSeparator: withSeparator },
    //     accesses.contentCreator,
    //     accesses.viewer,
    //   ];
    //   break;
    case RoomsType.CustomRoom:
    case RoomsType.AIRoom:
      options = [
        accesses.roomManager,
        { key: "s1", isSeparator: withSeparator },
        accesses.contentCreator,
        accesses.editor,
        accesses.reviewer,
        accesses.commentator,
        accesses.viewer,
      ];
      break;
    case RoomsType.PublicRoom:
      options = [accesses.roomManager, accesses.contentCreator];
      break;

    case RoomsType.FormRoom:
      options = [
        accesses.roomManager,
        { key: "s1", isSeparator: withSeparator },
        accesses.contentCreator,
        accesses.formFiller,
      ];
      break;

    case RoomsType.VirtualDataRoom:
      options = [
        accesses.roomManager,
        { key: "s1", isSeparator: withSeparator },
        accesses.contentCreator,
        accesses.editor,
        accesses.viewer,
        accesses.formFiller,
      ];
      break;

    case None:
      if (isOwner) options.push(accesses.portalAdmin);

      if (isAdmin || isOwner) {
        options.push(
          ...[
            accesses.roomAdmin,
            {
              key: "s1",
              isSeparator: withSeparator,
            },
          ],
        );
      }

      options = [...options, accesses.user];
      break;
    default:
      break;
  }

  const removeOption = [
    {
      key: "s2",
      isSeparator: true,
    },
    {
      key: "remove",
      label: t("Common:Remove"),
    },
  ];

  return withRemove ? [...options, ...removeOption] : options;
};
