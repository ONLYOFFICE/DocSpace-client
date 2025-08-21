import { TFolder } from "@docspace/shared/api/files/types";
import { TRoom } from "@docspace/shared/api/rooms/types";
import { TPathParts } from "@docspace/shared/types";

export type HeaderProps = {
  current: TFolder | TRoom;
  pathParts: TPathParts[];
  isEmptyList: boolean;

  showTitle?: boolean;
};
