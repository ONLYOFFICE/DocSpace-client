type RoomIconDefault = {
  title: string;
  isArchive?: boolean;
  size?: string;
  radius?: string;
  showDefault: boolean;
  imgClassName?: string;
  className?: string;
};

type RoomIconColor = {
  color: string;
  imgSrc?: undefined;
  imgClassName?: undefined;
};

type RoomIconImage = {
  color?: string | undefined;
  imgSrc: string;
  imgClassName?: string;
};

type RoomIconBadge = { badgeUrl?: string; onBadgeClick?: () => void };

type RoomIconNonBadge = { badgeUrl?: undefined; onBadgeClick?: undefined };

export type RoomIconProps = RoomIconDefault &
  (RoomIconColor | RoomIconImage) &
  (RoomIconBadge | RoomIconNonBadge);
