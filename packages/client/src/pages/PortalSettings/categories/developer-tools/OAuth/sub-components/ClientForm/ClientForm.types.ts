//@ts-ignore
import { OAuthStoreProps } from "SRC_DIR/store/OAuthStore";
import {
  IClientProps,
  IClientReqDTO,
  IScope,
} from "@docspace/common/utils/oauth/interfaces";
//@ts-ignore
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

  scopeList?: IScope[];

  fetchClient?: (clientId: string) => Promise<IClientProps>;
  fetchScopes?: () => Promise<void>;

  saveClient?: (client: IClientReqDTO) => Promise<IClientProps>;
  updateClient?: (
    clientId: string,
    client: IClientReqDTO
  ) => Promise<IClientReqDTO>;

  resetDialogVisible?: boolean;
  setResetDialogVisible?: (value: boolean) => void;

  currentDeviceType?: DeviceUnionType;

  setClientSecretProps?: (value: string) => void;
  clientSecretProps?: string;
}

export interface ClientStore {
  auth: { settingsStore: { currentDeviceType: DeviceUnionType } };
  oauthStore: OAuthStoreProps;
}
