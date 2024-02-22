import {
  TSelectorCancelButton,
  TSelectorHeader,
  TSelectorItem,
} from "../../components/selector/Selector.types";

import { RoomsType } from "../../enums";

export type RoomSelectorProps = TSelectorHeader &
  TSelectorCancelButton & {
    id?: string;
    className?: string;
    style?: React.CSSProperties;

    isMultiSelect: boolean;

    onSubmit: (items: TSelectorItem[]) => void;
    roomType?: RoomsType;
    excludeItems?: number[];
    setIsDataReady?: (value: boolean) => void;
    submitButtonLabel?: string;
    withSearch?: boolean;
  };
