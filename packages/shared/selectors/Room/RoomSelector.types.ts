import { SelectorProps } from "../../components/selector";
import { TLogo } from "../../api/rooms/types";
import { RoomsType } from "../../enums";

export interface RoomSelectorProps extends SelectorProps {
  excludeItems?: number[];
  roomType: RoomsType | 0;
  setIsDataReady: (value: boolean) => void;
}

export type TItem = {
  id: number;
  label: string;
  icon: string;
  color: string | undefined;
  logo: TLogo;
  roomType: RoomsType;
};

