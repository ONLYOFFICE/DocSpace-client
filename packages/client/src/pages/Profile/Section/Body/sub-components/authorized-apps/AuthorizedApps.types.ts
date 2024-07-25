import { IClientProps } from "@docspace/shared/utils/oauth/types";

import { DeviceUnionType } from "SRC_DIR/Hooks/useViewEffect";
import { ViewAsType } from "SRC_DIR/store/OAuthStore";

export interface AuthorizedAppsProps {
  consents?: IClientProps[];
  fetchConsents?: () => Promise<void>;

  viewAs: ViewAsType;
  setViewAs: (value: string) => void;

  currentDeviceType: DeviceUnionType;

  infoDialogVisible: boolean;
  fetchScopes?: () => Promise<void>;

  revokeDialogVisible: boolean;
  setRevokeDialogVisible: (value: boolean) => void;
  selection: string[];
  bufferSelection: IClientProps;
  revokeClient: (value: string[]) => Promise<void>;
}

export interface RevokeDialogProps {
  visible: boolean;

  onClose: () => void;
  selection: string[];
  bufferSelection: IClientProps;
  onRevoke: (value: string[]) => Promise<void>;
  currentDeviceType: DeviceUnionType;
}
