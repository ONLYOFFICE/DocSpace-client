import { RoomsType, ShareAccessRights } from "@docspace/shared/enums";
import { getUserRoleOptions } from "./getUserRoleOptions";

export const getUserRoleOptionsByRoomType = (
  t: any,
  roomType: RoomsType,
  canChangeUserRole: boolean = false,
) => {
  if (!roomType) return;

  const options = getUserRoleOptions(t);

  const deleteOption = canChangeUserRole
    ? [
        { key: "s2", isSeparator: true },
        {
          key: "remove",
          label: t("Common:Remove"),
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
