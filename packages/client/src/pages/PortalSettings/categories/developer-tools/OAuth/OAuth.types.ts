//@ts-ignore
import { ClientProps } from "@docspace/common/utils/oauth/dto";

//@ts-ignore
import { ViewAsType } from "SRC_DIR/store/OAuthStore";

export interface OAuthProps {
  viewAs: ViewAsType;
  clientList: ClientProps[];
  isEmptyClientList: boolean;
  fetchClients: (page: number) => Promise<void>;
}
