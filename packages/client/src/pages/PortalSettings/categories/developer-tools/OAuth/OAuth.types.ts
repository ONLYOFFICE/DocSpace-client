import { IClientProps } from "@docspace/shared/utils/oauth/types";

import { DeviceUnionType } from "SRC_DIR/Hooks/useViewEffect";
import { ViewAsType } from "SRC_DIR/store/OAuthStore";

export interface OAuthProps {
  viewAs: ViewAsType;
  setViewAs: (viewAs: string) => void;

  clientList: IClientProps[];
  isEmptyClientList: boolean;
  fetchClients: () => Promise<void>;
  fetchScopes: () => Promise<void>;

  currentDeviceType: DeviceUnionType;

  infoDialogVisible?: boolean;
  previewDialogVisible?: boolean;
  disableDialogVisible?: boolean;
  deleteDialogVisible?: boolean;
  generateDeveloperTokenDialogVisible?: boolean;
  revokeDeveloperTokenDialogVisible?: boolean;

  isInit: boolean;
  setIsInit: (value: boolean) => void;
}
