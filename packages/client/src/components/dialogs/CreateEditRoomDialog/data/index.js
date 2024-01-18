import { RoomsType } from "@docspace/shared/enums";

export const getRoomTypeTitleTranslation = (roomType = 1, t) => {
  switch (roomType) {
    case RoomsType.FillingFormsRoom:
      return t("CreateEditRoomDialog:FillingFormsRoomTitle");
    case RoomsType.EditingRoom:
      return t("CreateEditRoomDialog:CollaborationRoomTitle");
    case RoomsType.ReviewRoom:
      return t("CreateEditRoomDialog:ReviewRoomTitle");
    case RoomsType.ReadOnlyRoom:
      return t("CreateEditRoomDialog:ViewOnlyRoomTitle");
    case RoomsType.CustomRoom:
      return t("CreateEditRoomDialog:CustomRoomTitle");
    case RoomsType.PublicRoom:
      return t("Files:PublicRoom");
    case RoomsType.FormRoom:
      return t("CreateEditRoomDialog:FormRoomTitle");
  }
};

export const getRoomTypeDescriptionTranslation = (roomType = 1, t) => {
  switch (roomType) {
    case RoomsType.FillingFormsRoom:
      return t("CreateEditRoomDialog:FillingFormsRoomDescription");
    case RoomsType.EditingRoom:
      return t("CreateEditRoomDialog:CollaborationRoomDescription");
    case RoomsType.ReviewRoom:
      return t("CreateEditRoomDialog:ReviewRoomDescription");
    case RoomsType.ReadOnlyRoom:
      return t("CreateEditRoomDialog:ViewOnlyRoomDescription");
    case RoomsType.CustomRoom:
      return t("CreateEditRoomDialog:CustomRoomDescription");
    case RoomsType.PublicRoom:
      return t("CreateEditRoomDialog:PublicRoomDescription");
    case RoomsType.FormRoom:
      return t("CreateEditRoomDialog:FormRoomDescription");
  }
};

export const getRoomTypeDefaultTagTranslation = (roomType = 1, t) => {
  switch (roomType) {
    case RoomsType.FillingFormsRoom:
      return t("Files:FillingFormRooms");
    case RoomsType.EditingRoom:
      return t("Files:CollaborationRooms");
    case RoomsType.ReviewRoom:
      return t("Common:Review");
    case RoomsType.ReadOnlyRoom:
      return t("Files:ViewOnlyRooms");
    case RoomsType.CustomRoom:
      return t("Files:CustomRooms");
    case RoomsType.PublicRoom:
      return t("Files:PublicRoom");
    case RoomsType.FormRoom:
      return t("Files:FormRoom");
  }
};
