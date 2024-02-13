import {
  ShareAccessRights,
  RoomsType,
  EmployeeType,
} from "@docspace/shared/enums";

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
    docSpaceAdmin: {
      key: "docSpaceAdmin",
      label: t("Common:DocSpaceAdmin"),
      description: t("Translations:RoleDocSpaceAdminDescription"),
      ...(!standalone && { quota: t("Common:Paid") }),
      color: "#EDC409",
      access:
        roomType === -1 ? EmployeeType.Admin : ShareAccessRights.FullAccess,
      type: "admin",
    },
    roomAdmin: {
      key: "roomAdmin",
      label: t("Common:RoomAdmin"),
      description: t("Translations:RoleRoomAdminDescription"),
      ...(!standalone && { quota: t("Common:Paid") }),
      color: "#EDC409",
      access:
        roomType === -1 ? EmployeeType.User : ShareAccessRights.RoomManager,
      type: "manager",
    },
    collaborator: {
      key: "collaborator",
      label: t("Common:PowerUser"),
      description: t("Translations:RolePowerUserDescription"),
      ...(!standalone && { quota: t("Common:Paid") }),
      color: "#EDC409",
      access:
        roomType === -1
          ? EmployeeType.Collaborator
          : ShareAccessRights.Collaborator,
      type: "collaborator",
    },
    user: {
      key: "user",
      label: t("Common:User"),
      description: t("Translations:RoleUserDescription"),
      access: EmployeeType.Guest,
      type: "user",
    },
    editor: {
      key: "editor",
      label: t("Translations:RoleEditor"),
      description: t("Translations:RoleEditorDescription"),
      access: ShareAccessRights.Editing,
      type: "user",
    },
    formFiller: {
      key: "formFiller",
      label: t("Translations:RoleFormFiller"),
      description: t("Translations:RoleFormFillerDescription"),
      access: ShareAccessRights.FormFilling,
      type: "user",
    },
    reviewer: {
      key: "reviewer",
      label: t("Translations:RoleReviewer"),
      description: t("Translations:RoleReviewerDescription"),
      access: ShareAccessRights.Review,
      type: "user",
    },
    commentator: {
      key: "commentator",
      label: t("Translations:RoleCommentator"),
      description: t("Translations:RoleCommentatorDescription"),
      access: ShareAccessRights.Comment,
      type: "user",
    },
    viewer: {
      key: "viewer",
      label: t("Translations:RoleViewer"),
      description: t("Translations:RoleViewerDescription"),
      access: ShareAccessRights.ReadOnly,
      type: "user",
    },
  };

  switch (roomType) {
    case RoomsType.FillingFormsRoom:
      options = [
        accesses.roomAdmin,
        accesses.collaborator,
        { key: "s1", isSeparator: withSeparator },
        accesses.formFiller,
        accesses.viewer,
      ];
      break;
    case RoomsType.EditingRoom:
      options = [
        accesses.roomAdmin,
        accesses.collaborator,
        { key: "s1", isSeparator: withSeparator },
        accesses.editor,
        accesses.viewer,
      ];
      break;
    case RoomsType.ReviewRoom:
      options = [
        accesses.roomAdmin,
        accesses.collaborator,
        { key: "s1", isSeparator: withSeparator },
        accesses.reviewer,
        accesses.commentator,
        accesses.viewer,
      ];
      break;
    case RoomsType.ReadOnlyRoom:
      options = [
        accesses.roomAdmin,
        accesses.collaborator,
        { key: "s1", isSeparator: withSeparator },
        accesses.viewer,
      ];
      break;
    case RoomsType.CustomRoom:
      options = [
        accesses.roomAdmin,
        accesses.collaborator,
        { key: "s1", isSeparator: withSeparator },
        accesses.editor,
        accesses.formFiller,
        accesses.reviewer,
        accesses.commentator,
        accesses.viewer,
      ];
      break;
    case RoomsType.PublicRoom:
      options = [accesses.roomAdmin, accesses.collaborator];
      break;

    case RoomsType.FormRoom:
      options = [
        accesses.roomAdmin,
        accesses.collaborator,
        { key: "s1", isSeparator: withSeparator },
        accesses.viewer,
        accesses.formFiller,
      ];
      break;
    case -1:
      if (isOwner) options.push(accesses.docSpaceAdmin);

      options = [
        ...options,
        accesses.roomAdmin,
        accesses.collaborator,
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
      label: t("Translations:Remove"),
    },
  ];

  return withRemove ? [...options, ...removeOption] : options;
};
