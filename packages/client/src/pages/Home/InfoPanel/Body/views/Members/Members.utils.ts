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

import { ShareAccessRights, RoomsType } from "@docspace/shared/enums";
import { TTranslation } from "@docspace/shared/types";

class MembersHelper {
  t: TTranslation;

  constructor(props: { t: TTranslation }) {
    this.t = props.t;
  }

  getOptions = () => {
    return {
      portalAdmin: {
        key: "owner",
        label: this.t("Common:Owner"),
        access: ShareAccessRights.FullAccess,
        type: "admin",
      },
      roomAdmin: {
        key: "roomAdmin",
        label: this.t("Common:RoomManager"),
        tooltip: this.t("InviteDialog:UserMaxAvailableRoleWarning", {
          productName: this.t("Common:ProductName"),
        }),
        access: ShareAccessRights.RoomManager,
        type: "manager",
      },
      agentAdmin: {
        key: "agentAdmin",
        label: this.t("Common:AgentManager"),
        tooltip: this.t("InviteDialog:UserAgentMaxAvailableRoleWarning", {
          productName: this.t("Common:ProductName"),
        }),
        access: ShareAccessRights.RoomManager,
        type: "manager",
      },
      collaborator: {
        key: "collaborator",
        label: this.t("Common:ContentCreator"),
        access: ShareAccessRights.Collaborator,
        type: "collaborator",
      },
      viewer: {
        key: "viewer",
        label: this.t("Common:RoleViewer"),
        access: ShareAccessRights.ReadOnly,
        type: "user",
      },
      editor: {
        key: "editor",
        label: this.t("Common:Editor"),
        access: ShareAccessRights.Editing,
        type: "user",
      },
      formFiller: {
        key: "formFiller",
        label: this.t("Common:RoleFormFiller"),
        access: ShareAccessRights.FormFilling,
        type: "user",
      },
      reviewer: {
        key: "reviewer",
        label: this.t("Common:RoleReviewer"),
        access: ShareAccessRights.Review,
        type: "user",
      },
      commentator: {
        key: "commentator",
        label: this.t("Common:RoleCommentator"),
        access: ShareAccessRights.Comment,
        type: "user",
      },
    };
  };

  getOptionsByRoomType = (roomType: RoomsType, canChangeUserRole = false) => {
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
      case RoomsType.EditingRoom:
        return [
          options.roomAdmin,
          options.collaborator,
          options.editor,
          options.viewer,
          ...deleteOption,
        ];

      case RoomsType.CustomRoom:
        return [
          options.roomAdmin,
          options.collaborator,
          options.editor,
          options.reviewer,
          options.commentator,
          options.viewer,
          ...deleteOption,
        ];

      case RoomsType.FormRoom:
        return [
          options.roomAdmin,
          options.collaborator,
          options.formFiller,
          ...deleteOption,
        ];
      case RoomsType.PublicRoom:
        return [options.roomAdmin, options.collaborator, ...deleteOption];
      case RoomsType.VirtualDataRoom:
        return [
          options.roomAdmin,
          options.collaborator,
          options.editor,
          options.formFiller,
          options.viewer,
          ...deleteOption,
        ];
      case RoomsType.AIRoom:
        return [
          options.agentAdmin,
          options.collaborator,
          options.viewer,
          ...deleteOption,
        ];
      default:
        return [];
    }
  };

  getOptionByUserAccess = (
    access: ShareAccessRights,
    isAIAgentsFolderRoot?: boolean,
  ) => {
    if (!access) return;

    const options = this.getOptions();

    if (isAIAgentsFolderRoot && access === ShareAccessRights.RoomManager)
      return options.agentAdmin;

    const [userOption] = Object.values(options).filter(
      (opt) => opt.access === access,
    );

    return userOption;
  };
}

export default MembersHelper;
