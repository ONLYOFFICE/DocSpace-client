import { ClientProps, Scope } from "@docspace/common/utils/oauth/interfaces";

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

export interface BlockHeaderProps {
  header: string;
  helpButtonText: string;
}

export interface BlockProps {
  children: React.ReactNode;
}

export interface ClientFormProps {
  id?: string;
  client?: ClientProps;

  tenant?: number;
  fetchTenant?: () => Promise<number>;

  scopeList?: Scope[];

  fetchClient?: (clientId: string) => Promise<ClientProps>;
  fetchScopes?: () => Promise<void>;

  saveClient?: (client: ClientProps) => Promise<ClientProps>;
  updateClient?: (
    clientId: string,
    client: ClientProps
  ) => Promise<ClientProps>;

  regenerateSecret?: (clientId: string) => Promise<string>;
}

export interface PreviewProps {
  clientId: string;
  redirectURI: string;
  scopes: string[];
}
