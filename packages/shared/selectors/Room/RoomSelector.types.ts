import {
  TSelectorCancelButton,
  TSelectorHeader,
  TSelectorItem,
} from "../../components/selector/Selector.types";
import { TLogo } from "../../api/rooms/types";
import { RoomsType } from "../../enums";

export type RoomSelectorProps = TSelectorHeader &
  TSelectorCancelButton & {
    id?: string;
    className?: string;
    style?: React.CSSProperties;

    isMultiSelect: boolean;

    onSubmit: (items: TSelectorItem[]) => void;

    excludeItems?: number[];
    setIsDataReady?: (value: boolean) => void;
  };

export type TItem = {
  id: number;
  label: string;
  icon: string;
  color: string | undefined;
  logo: TLogo;
  roomType: RoomsType;
};
