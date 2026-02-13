import type { TFilesSettings } from "@docspace/shared/api/files/types";
import type { TValidateShareRoom } from "@docspace/shared/api/rooms/types";

export interface PublicPreviewViewerProps {
  extsImagePreviewed: string[];

  openUrl: TStore["settingsStore"]["openUrl"];
  getIcon: (size: number, fileExst: string) => string;
}

export interface PublicPreviewLoaderProps {
  key: string;
  settings: TFilesSettings;
  validateData: TValidateShareRoom;
}
