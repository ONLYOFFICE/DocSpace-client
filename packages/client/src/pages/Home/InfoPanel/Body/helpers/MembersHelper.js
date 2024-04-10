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
  EmployeeType,
  RoomsType,
} from "@docspace/shared/enums";

class MembersHelper {
  constructor(props) {
    this.t = props.t;
  }

  getOptions = () => {
    return {
      docSpaceAdmin: {
        key: "owner",
        label: this.t("Common:Owner"),
        access: ShareAccessRights.FullAccess,
        type: "admin",
      },
      roomAdmin: {
        key: "roomAdmin",
        label: this.t("Common:RoomAdmin"),
        access: ShareAccessRights.RoomManager,
        type: "manager",
      },
      collaborator: {
        key: "collaborator",
        label: this.t("Common:PowerUser"),
        access: ShareAccessRights.Collaborator,
        type: "collaborator",
      },
      viewer: {
        key: "viewer",
        label: this.t("Translations:RoleViewer"),
        access: ShareAccessRights.ReadOnly,
        type: "user",
      },
      editor: {
        key: "editor",
        label: this.t("Translations:RoleEditor"),
        access: ShareAccessRights.Editing,
        type: "user",
      },
      formFiller: {
        key: "formFiller",
        label: this.t("Translations:RoleFormFiller"),
        access: ShareAccessRights.FormFilling,
        type: "user",
      },
      reviewer: {
        key: "reviewer",
        label: this.t("Translations:RoleReviewer"),
        access: ShareAccessRights.Review,
        type: "user",
      },
      commentator: {
        key: "commentator",
        label: this.t("Translations:RoleCommentator"),
        access: ShareAccessRights.Comment,
        type: "user",
      },
    };
  };

  getOptionsByRoomType = (roomType, canChangeUserRole = false) => {
    if (!roomType) return;

    const options = this.getOptions();

    const deleteOption = canChangeUserRole
      ? [
          { key: "s2", isSeparator: true },
          {
            key: "remove",
            label: this.t("Common:Remove"),
            access: ShareAccessRights.None,
          },
        ]
      : [];

    switch (roomType) {
      case RoomsType.FillingFormsRoom:
        return [
          options.roomAdmin,
          options.collaborator,
          options.formFiller,
          options.viewer,
          ...deleteOption,
        ];
      case RoomsType.EditingRoom:
        return [
          options.roomAdmin,
          options.collaborator,
          options.editor,
          options.viewer,
          ...deleteOption,
        ];
      case RoomsType.ReviewRoom:
        return [
          options.roomAdmin,
          options.collaborator,
          options.reviewer,
          options.commentator,
          options.viewer,
          ...deleteOption,
        ];
      case RoomsType.ReadOnlyRoom:
        return [
          options.roomAdmin,
          options.collaborator,
          options.viewer,
          ...deleteOption,
        ];
      case RoomsType.CustomRoom:
        return [
          options.roomAdmin,
          options.collaborator,
          options.editor,
          options.formFiller,
          options.reviewer,
          options.commentator,
          options.viewer,
          ...deleteOption,
        ];

      case RoomsType.FormRoom:
        return [
          options.roomAdmin,
          options.collaborator,
          options.viewer,
          options.formFiller,
          ...deleteOption,
        ];
      case RoomsType.PublicRoom:
        return [options.roomAdmin, options.collaborator, ...deleteOption];
      default:
        return [];
    }
  };

  getOptionByUserAccess = (access) => {
    if (!access) return;

    const options = this.getOptions();
    const [userOption] = Object.values(options).filter(
      (opt) => opt.access === access,
    );

    return userOption;
  };
}

export default MembersHelper;
