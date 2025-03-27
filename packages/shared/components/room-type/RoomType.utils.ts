import { TTranslation } from "../../types";
import { RoomsType } from "../../enums";

export const getRoomTypeTitleTranslation = (
  t: TTranslation,
  roomType: RoomsType = 1,
  isTemplate: boolean = false,
) => {
  if (isTemplate) return t("Common:FromTemplate");

  switch (roomType) {
    case RoomsType.EditingRoom:
      return t("Common:CollaborationRoomTitle");
    case RoomsType.VirtualDataRoom:
      return t("Common:VirtualDataRoom");
    case RoomsType.CustomRoom:
      return t("Common:CustomRoomTitle");
    case RoomsType.AIRoom:
      return "AI room";
    case RoomsType.PublicRoom:
      return t("Common:PublicRoom");
    case RoomsType.FormRoom:
      return t("Common:FormFilingRoomTitle");
    default:
      return "";
  }
};

export const getRoomTypeDescriptionTranslation = (
  t: TTranslation,
  roomType: RoomsType = 1,
  isTemplate: boolean = false,
) => {
  if (isTemplate) return t("Common:FromTemplateRoomInfo");

  switch (roomType) {
    case RoomsType.EditingRoom:
      return t("Common:CollaborationRoomDescription");
    case RoomsType.VirtualDataRoom:
      return t("Common:VirtualDataRoomDescription");
    case RoomsType.CustomRoom:
      return t("Common:CustomRoomDescription");
    case RoomsType.AIRoom:
      return "Create a room together with an AI that can help you understand room types, answer questions, and customize the room being created.";
    case RoomsType.PublicRoom:
      return t("Common:PublicRoomInfo");
    case RoomsType.FormRoom:
      return t("Common:FormFilingRoomInfo");
    default:
      return "";
  }
};
