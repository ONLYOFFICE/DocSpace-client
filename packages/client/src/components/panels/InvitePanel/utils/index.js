// (c) Copyright Ascensio System SIA 2009-2024
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

import {
  ShareAccessRights,
  RoomsType,
  EmployeeType,
} from "@docspace/shared/enums";
import { globalColors } from "@docspace/shared/themes";
import { getUserTypeTranslation } from "@docspace/shared/utils/common";
import { checkIfAccessPaid } from "SRC_DIR/helpers";

/**
 * @param {RoomsType} roomType
 * @param {(key: string) => string} t
 * @returns {string}
 */
const getRoomAdminDescription = (roomType, t) => {
  switch (roomType) {
    case RoomsType.FormRoom:
      return t("Translations:RoleRoomAdminFormRoomDescription");
    case -1:
      return t("Translations:RoleRoomAdminDescription");
    default:
      return t("Translations:RoleRoomManagerDescription");
  }
};
/**
 * @param {RoomsType} roomType
 * @param {(key: string)=> string} t
 * @returns {string}
 */
const getPowerUserDescription = (roomType, t) => {
  switch (roomType) {
    case RoomsType.FormRoom:
      return t("Translations:RolePowerUserFormRoomDescription");
    case -1:
      return t("Translations:RoleNewUserDescription");
    default:
      return t("Translations:RoleContentCreatorDescription");
  }
};

/**
 * @param {RoomsType} roomType
 * @param {(key: string)=> string} t
 * @returns {string}
 */
const getFormFillerDescription = (roomType, t) => {
  switch (roomType) {
    case RoomsType.FormRoom:
      return t("Translations:RoleFormFillerFormRoomDescription");

    default:
      return t("Translations:RoleFormFillerDescription");
  }
};

export const getAccessOptions = (
  t,
  roomType = RoomsType.CustomRoom,
  withRemove = false,
  withSeparator = false,
  isOwner = false,
  standalone = false,
) => {
  let options = [];
  const accesses = {
    portalAdmin: {
      key: EmployeeType.PortalAdmin,
      label: getUserTypeTranslation(EmployeeType.PortalAdmin, t),
      description: t("Translations:RolePortalAdminDescription", {
        productName: t("Common:ProductName"),
      }),
      ...(!standalone && { quota: t("Common:Paid") }),
      color: globalColors.favoritesStatus,
      access:
        roomType === -1 ? EmployeeType.Admin : ShareAccessRights.FullAccess,
      type: EmployeeType.PortalAdmin,
    },
    roomAdmin: {
      key: "roomAdmin",
      label: t("Common:RoomAdmin"),
      description: getRoomAdminDescription(roomType, t),
      ...(!standalone && { quota: t("Common:Paid") }),
      color: globalColors.favoritesStatus,
      access:
        roomType === -1 ? EmployeeType.User : ShareAccessRights.RoomManager,
      type: EmployeeType.RoomAdmin,
    },
    roomManager: {
      key: "roomManager",
      label: t("Common:RoomManager"),
      description: getRoomAdminDescription(roomType, t),
      ...(!standalone && { quota: t("Common:Paid") }),
      color: globalColors.favoritesStatus,
      access:
        roomType === -1 ? EmployeeType.User : ShareAccessRights.RoomManager,
      type: EmployeeType.RoomAdmin,
    },
    user: {
      key: "newUser",
      label: t("Common:User"),
      description: getPowerUserDescription(roomType, t),
      access:
        roomType === -1
          ? EmployeeType.Collaborator
          : ShareAccessRights.Collaborator,
      type: EmployeeType.CollaboratorString,
    },
    contentCreator: {
      key: "contentCreator",
      label: t("Common:ContentCreator"),
      description: getPowerUserDescription(roomType, t),
      access:
        roomType === -1
          ? EmployeeType.Collaborator
          : ShareAccessRights.Collaborator,
      type: EmployeeType.CollaboratorString,
    },
    editor: {
      key: "editor",
      label: t("Common:Editor"),
      description: t("Translations:RoleEditorDescription"),
      access: ShareAccessRights.Editing,
      type: EmployeeType.CollaboratorString,
    },
    formFiller: {
      key: "formFiller",
      label: t("Translations:RoleFormFiller"),
      description: getFormFillerDescription(roomType, t),
      access: ShareAccessRights.FormFilling,
      type: EmployeeType.CollaboratorString,
    },
    reviewer: {
      key: "reviewer",
      label: t("Translations:RoleReviewer"),
      description: t("Translations:RoleReviewerDescription"),
      access: ShareAccessRights.Review,
      type: EmployeeType.CollaboratorString,
    },
    commentator: {
      key: "commentator",
      label: t("Translations:RoleCommentator"),
      description: t("Translations:RoleCommentatorDescription"),
      access: ShareAccessRights.Comment,
      type: EmployeeType.CollaboratorString,
    },
    viewer: {
      key: "viewer",
      label: t("Translations:RoleViewer"),
      description: t("Translations:RoleViewerDescription"),
      access: ShareAccessRights.ReadOnly,
      type: EmployeeType.CollaboratorString,
    },
  };

  switch (roomType) {
    case RoomsType.FillingFormsRoom:
      options = [
        accesses.roomAdmin,
        { key: "s1", isSeparator: withSeparator },
        accesses.contentCreator,
        accesses.formFiller,
        accesses.viewer,
      ];
      break;
    case RoomsType.EditingRoom:
      options = [
        accesses.roomManager,
        { key: "s1", isSeparator: withSeparator },
        accesses.contentCreator,
        accesses.editor,
        accesses.viewer,
      ];
      break;
    case RoomsType.ReviewRoom:
      options = [
        accesses.roomManager,
        { key: "s1", isSeparator: withSeparator },
        accesses.contentCreator,
        accesses.reviewer,
        accesses.commentator,
        accesses.viewer,
      ];
      break;
    case RoomsType.ReadOnlyRoom:
      options = [
        accesses.roomManager,
        { key: "s1", isSeparator: withSeparator },
        accesses.contentCreator,
        accesses.viewer,
      ];
      break;
    case RoomsType.CustomRoom:
      options = [
        accesses.roomManager,
        { key: "s1", isSeparator: withSeparator },
        accesses.contentCreator,
        accesses.editor,
        accesses.formFiller,
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
        accesses.roomAdmin,
        { key: "s1", isSeparator: withSeparator },
        accesses.contentCreator,
        accesses.editor,
        accesses.viewer,
      ];
      break;

    case -1:
      if (isOwner) options.push(accesses.portalAdmin);

      options = [
        ...options,
        accesses.roomAdmin,
        { key: "s1", isSeparator: withSeparator },
        accesses.user,
      ];
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

export const getTopFreeRole = (t, roomType) => {
  const accesses = getAccessOptions(t, roomType);
  const freeAccesses = accesses.filter(
    (item) => !checkIfAccessPaid(item.access) && item.key !== "s1",
  );
  return freeAccesses[0];
};

export const isPaidUserRole = (selectedAccess) => {
  return (
    selectedAccess === ShareAccessRights.FullAccess ||
    selectedAccess === ShareAccessRights.RoomManager
  );
};

export const getFreeUsersTypeArray = () => {
  return [EmployeeType.Guest];
};

export const getFreeUsersRoleArray = () => {
  return [
    ShareAccessRights.Comment,
    ShareAccessRights.Editing,
    ShareAccessRights.FormFilling,
    ShareAccessRights.ReadOnly,
    ShareAccessRights.Review,
    ShareAccessRights.Collaborator,
  ];
};

export const fixAccess = (item, t, roomType) => {
  const topFreeRole = getTopFreeRole(t, roomType);
  makeFreeRole(item, t, topFreeRole);
};

export const makeFreeRole = (item, t, freeRole) => {
  if (!freeRole) return item;

  item.access = freeRole.access;
  item.warning = item.isGroup
    ? t("GroupMaxAvailableRoleWarning", {
        roleName: freeRole.label,
      })
    : t("UserMaxAvailableRoleWarning", {
        productName: t("Common:ProductName"),
      });
  return item;
};
