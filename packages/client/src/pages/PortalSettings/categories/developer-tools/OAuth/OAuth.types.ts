//@ts-ignore
import { DeviceUnionType } from "@docspace/common/hooks/useViewEffect";
import { IClientProps } from "@docspace/common/utils/oauth/interfaces";

//@ts-ignore
import { ViewAsType } from "SRC_DIR/store/OAuthStore";

export interface OAuthProps {
  viewAs: ViewAsType;
  setViewAs: (viewAs: ViewAsType) => void;

  clientList: IClientProps[];
  isEmptyClientList: boolean;
  fetchClients: () => Promise<void>;

  currentDeviceType: DeviceUnionType;
}
