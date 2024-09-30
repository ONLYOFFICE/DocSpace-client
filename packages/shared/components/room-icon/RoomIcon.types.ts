import { TColorScheme } from "@docspace/shared/themes";

type RoomIconDefault = {
  title: string;
  isArchive?: boolean;
  size?: string;
  radius?: string;
  showDefault: boolean;
  imgClassName?: string;
  className?: string;
};

type Model = {
  label: string;
  icon: string;
  key: string;
  onClick: (e: React.MouseEvent) => void;
};

type RoomIconExpansion = {
  hoverSrc?: string;
  withEditing?: boolean;
  onChangeFile?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEmptyIcon?: boolean;
  dropDownManualX: string;
  model?: Model;
  currentColorScheme: TColorScheme;
};

type RoomIconColor = {
  color: string;
  logo?: undefined;
  imgClassName?: undefined;
};

type RoomIconCover = {
  data: string;
  id: string;
};

type Logo = {
  color: string;
  large: string;
  medium?: string;
  original: string;
  small: string;
  cover?: RoomIconCover;
};

type RoomIconImage = {
  color?: string | undefined;
  logo: Logo | string;
  imgClassName?: string;
};

type RoomIconBadge = { badgeUrl?: string; onBadgeClick?: () => void };

type RoomIconNonBadge = { badgeUrl?: undefined; onBadgeClick?: undefined };

export type RoomIconProps = RoomIconDefault &
  RoomIconExpansion &
  (RoomIconColor | RoomIconImage) &
  (RoomIconBadge | RoomIconNonBadge);
