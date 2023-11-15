//@ts-ignore
import { DeviceUnionType } from "SRC_DIR/Hooks/useViewEffect";
import { IClientProps } from "@docspace/common/utils/oauth/interfaces";

//@ts-ignore
import { ViewAsType } from "SRC_DIR/store/OAuthStore";

export interface OAuthProps {
  viewAs: ViewAsType;
  setViewAs: (viewAs: ViewAsType) => void;

  clientList: IClientProps[];
  isEmptyClientList: boolean;
  fetchClients: () => Promise<void>;
  fetchScopes: () => Promise<void>;

  currentDeviceType: DeviceUnionType;

  infoDialogVisible?: boolean;
  previewDialogVisible?: boolean;
  isInit: boolean;
  setIsInit: (value: boolean) => void;
}
