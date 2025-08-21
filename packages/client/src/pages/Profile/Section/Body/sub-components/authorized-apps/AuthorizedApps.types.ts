import { DeviceType } from "@docspace/shared/enums";
import { IClientProps } from "@docspace/shared/utils/oauth/types";

import { ViewAsType } from "SRC_DIR/store/OAuthStore";

export interface AuthorizedAppsProps {
  consents?: IClientProps[];
  fetchConsents?: () => Promise<void>;

  viewAs?: ViewAsType;
  setViewAs?: (value: string) => void;

  currentDeviceType?: DeviceType;

  infoDialogVisible?: boolean;
  fetchScopes?: () => Promise<void>;

  revokeDialogVisible?: boolean;
  setRevokeDialogVisible?: (value: boolean) => void;
  selection?: string[];
  bufferSelection?: IClientProps;
  revokeClient?: (value: string[]) => Promise<void>;
  logoText?: string;
}

export interface RevokeDialogProps {
  visible: boolean;

  onClose: () => void;
  selection: string[];
  bufferSelection: IClientProps;
  onRevoke: (value: string[]) => Promise<void>;
  currentDeviceType: DeviceType;
  logoText: string;
}
