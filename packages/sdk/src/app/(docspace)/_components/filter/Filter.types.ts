import { TFilesSettings } from "@docspace/shared/api/files/types";

export type FilterProps = {
  filesFilter: string;
  filesSettings: TFilesSettings;

  shareKey?: string;
};
