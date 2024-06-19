import { TTranslation } from "../../types";
import { RoomsType } from "../../enums";

export const getRoomTypeTitleTranslation = (
  t: TTranslation,
  roomType: RoomsType = 1,
) => {
  switch (roomType) {
    // case RoomsType.FillingFormsRoom:
    //   return t("Common:FillingFormsRoomTitle");
    case RoomsType.EditingRoom:
      return t("Common:CollaborationRoomTitle");
    // case RoomsType.ReviewRoom:
    //   return t("Common:ReviewRoomTitle");
    // case RoomsType.ReadOnlyRoom:
    //   return t("Common:ViewOnlyRoomTitle");
    case RoomsType.CustomRoom:
      return t("Common:CustomRoomTitle");
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
) => {
  switch (roomType) {
    // case RoomsType.FillingFormsRoom:
    //   return t("Common:FillingFormsRoomDescription");
    case RoomsType.EditingRoom:
      return t("Common:CollaborationRoomDescription");
    // case RoomsType.ReviewRoom:
    //   return t("Common:ReviewRoomDescription");
    // case RoomsType.ReadOnlyRoom:
    //   return t("Common:ViewOnlyRoomDescription");
    case RoomsType.CustomRoom:
      return t("Common:CustomRoomDescription");
    case RoomsType.PublicRoom:
      return t("Common:PublicRoomDescription");
    case RoomsType.FormRoom:
      return t("Common:FormFilingRoomDescription");
    default:
      return "";
  }
};
