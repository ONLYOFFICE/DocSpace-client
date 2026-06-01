// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

import { ShareAccessRights, RoomsType } from "@docspace/shared/enums";
import { TTranslation } from "@docspace/shared/types";
import { getBrandName } from "@docspace/shared/constants/brands";

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
        tooltip: this.t("Common:UserMaxAvailableRoleWarning", {
          productName: getBrandName("ProductName"),
        }),
        access: ShareAccessRights.RoomManager,
        type: "manager",
      },
      agentAdmin: {
        key: "agentAdmin",
        label: this.t("Common:AgentManager"),
        tooltip: this.t("Common:UserAgentMaxAvailableRoleWarning", {
          productName: getBrandName("ProductName"),
        }),
        access: ShareAccessRights.RoomManager,
        type: "manager",
      },
      collaborator: {
        key: "collaborator",
        label: this.t("Common:ContentCreator"),
        access: ShareAccessRights.Collaborator,
        tooltip: this.t("Common:GuestAgentMaxAvailableRoleWarning", {
          productName: getBrandName("ProductName"),
        }),
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
