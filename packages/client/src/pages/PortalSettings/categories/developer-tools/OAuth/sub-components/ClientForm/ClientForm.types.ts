import { IClientProps, IScope } from "@docspace/common/utils/oauth/interfaces";

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

  saveClient?: (client: IClientProps) => Promise<IClientProps>;
  updateClient?: (
    clientId: string,
    client: IClientProps
  ) => Promise<IClientProps>;

  regenerateSecret?: (clientId: string) => Promise<string>;
}

export interface PreviewProps {
  clientId: string;
  redirectURI: string;
  scopes: string[];
}
