import { TFolder } from "@docspace/shared/api/files/types";
import { TRoom } from "@docspace/shared/api/rooms/types";
import { TPathParts } from "@docspace/shared/types";

export type HeaderProps = {
  current: TFolder | TRoom;
  pathParts: TPathParts[];
  isEmptyList: boolean;

  showTitle?: boolean;
  onBurgerClick?: () => void;
  isInfoPanelVisible?: boolean;
  onToggleInfoPanel?: () => void;
  headerOffset?: number;
  /** Optional button rendered inside Navigation's control buttons area. */
  aiChatButton?: React.ReactNode;

  /**
   * Optional decoration shown next to the current folder title. Used by
   * private rooms to surface the lock badge; left as a slot so other
   * future route groups (lifetime rooms, external folders) can plug in
   * their own icons without forking the header.
   */
  titleIcon?: string;
  titleIconTooltip?: string;
};
