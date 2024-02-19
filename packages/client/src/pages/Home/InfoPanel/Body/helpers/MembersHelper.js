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
