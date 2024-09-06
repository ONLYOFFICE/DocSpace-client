import { IClientProps, TScope } from "@docspace/shared/utils/oauth/types";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";

import { OAuthStoreProps } from "SRC_DIR/store/OAuthStore";
import { DeviceUnionType } from "SRC_DIR/Hooks/useViewEffect";

export interface InputProps {
  value: string;
  name: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  isReadOnly?: boolean;
  isSecret?: boolean;
  withCopy?: boolean;

  withButton?: boolean;
  buttonLabel?: string;
  onClickButton?: () => void;

  multiplyInput?: boolean;
}

export interface CheckboxProps {
  isChecked: boolean;
  onChange: () => void;

  label: string;
  description: string;
}

export interface BlockProps {
  children: React.ReactNode;
}

export interface ClientFormProps {
  id?: string;
  client?: IClientProps;

  scopeList?: TScope[];

  fetchScopes?: () => Promise<void>;

  resetDialogVisible?: boolean;
  setResetDialogVisible?: (value: boolean) => void;

  currentDeviceType?: DeviceUnionType;
  maxImageUploadSize?: number;

  setClientSecretProps?: (value: string) => void;
  clientSecretProps?: string;
}

export interface ClientStore {
  settingsStore: SettingsStore;
  oauthStore: OAuthStoreProps;
}
