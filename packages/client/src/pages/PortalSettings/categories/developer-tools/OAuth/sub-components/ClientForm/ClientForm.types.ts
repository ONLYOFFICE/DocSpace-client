import { ClientProps, ScopeDTO } from "@docspace/common/utils/oauth/dto";

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

  scopeList?: ScopeDTO[];

  fetchClient?: (clientId: string) => Promise<ClientProps>;
  fetchScopes?: () => Promise<void>;

  saveClient: (client: ClientProps) => Promise<ClientProps>;
  updateClient: (clientId: string, client: ClientProps) => Promise<ClientProps>;

  regenerateSecret?: (clientId: string) => Promise<string>;
}
