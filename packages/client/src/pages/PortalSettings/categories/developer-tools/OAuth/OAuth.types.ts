import { DeviceType } from "@docspace/shared/enums";
import { IClientProps } from "@docspace/shared/utils/oauth/types";

import { ViewAsType } from "SRC_DIR/store/OAuthStore";

export interface OAuthProps {
  viewAs: ViewAsType;
  setViewAs: (viewAs: string) => void;

  clientList: IClientProps[];
  isEmptyClientList: boolean;
  fetchClients: () => Promise<void>;
  fetchScopes: () => Promise<void>;

  currentDeviceType: DeviceType;

  infoDialogVisible?: boolean;
  previewDialogVisible?: boolean;
  disableDialogVisible?: boolean;
  deleteDialogVisible?: boolean;
  generateDeveloperTokenDialogVisible?: boolean;
  revokeDeveloperTokenDialogVisible?: boolean;

  isInit: boolean;
  setIsInit: (value: boolean) => void;

  apiOAuthLink: string;
}
