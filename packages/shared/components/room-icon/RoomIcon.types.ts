import { TLogo } from "../../api/rooms/types";
import { Nullable } from "../../types";

type RoomIconDefault = {
  title: string;
  isArchive?: boolean;
  size?: string;
  radius?: string;
  showDefault: boolean;
  imgClassName?: string;
  className?: string;
};

export type TModel = { label: string; icon: string } & (
  | {
      key: string;
      onClick: () => void;
    }
  | {
      key: "upload";
      onClick: (ref?: React.MutableRefObject<Nullable<HTMLDivElement>>) => void;
    }
);

type RoomIconExpansion = {
  hoverSrc?: string;
  withEditing?: boolean;
  onChangeFile?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEmptyIcon?: boolean;
  dropDownManualX?: string;
  model?: TModel[];
  logo?: TLogo | string;
  isTemplate?: boolean;
};

type RoomIconColor = {
  color: string;
  imgClassName?: undefined;
};

type RoomIconImage = {
  color?: string | undefined;
  imgClassName?: string;
};

type RoomIconBadge = { badgeUrl?: string; onBadgeClick?: () => void };

type RoomIconNonBadge = { badgeUrl?: undefined; onBadgeClick?: undefined };

export type RoomIconProps = RoomIconDefault &
  RoomIconExpansion &
  (RoomIconColor | RoomIconImage) &
  (RoomIconBadge | RoomIconNonBadge);
