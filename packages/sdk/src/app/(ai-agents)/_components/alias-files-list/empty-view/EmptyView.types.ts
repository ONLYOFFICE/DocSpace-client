import { TFolder } from "@docspace/shared/api/files/types";

export type EmptyViewProps = {
  current: TFolder;
  folderId: string | number;
  isFiltered: boolean;
  shareKey?: string;
};
