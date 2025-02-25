import React from "react";
import { RoomsType } from "../../enums/index";

export type RoomTypeProps = {
  roomType: RoomsType;
  isOpen: boolean;

  type?: "listItem" | "dropdownButton" | "dropdownItem";
  id?: string;
  selectedId: string | number;

  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  disabledFormRoom?: boolean;
  isTemplate?: boolean;
  isTemplateRoom?: boolean;
};
