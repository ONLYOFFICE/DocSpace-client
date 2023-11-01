import { ScopeGroup, ScopeType } from "./enums";

export interface IScope {
  name: string;
  group: ScopeGroup;
  type: ScopeType;
  tKey?: string;
}

export interface IFilteredScopes {
  [key: string]: {
    isChecked: boolean;
    checkedType?: ScopeType;
    read: IScope;
    write: IScope;
  };
}

export interface INoAuthClientProps {
  name: string;
  logo: string;
  websiteUrl: string;
  policyUrl?: string;
  termsUrl?: string;
  scopes?: string[];
}

export interface IClientProps {
  name: string;
  clientId: string;
  clientSecret: string;
  description: string;
  policyUrl: string;
  termsUrl: string;
  logo: string;
  authenticationMethod: string;
  tenant: number;
  redirectUris: string[];
  logoutRedirectUris: string[];
  enabled: boolean;
  invalidated: boolean;
  scopes: string[];
  websiteUrl: string;
  allowedOrigins: string[];

  createdOn?: Date;
  modifiedOn?: Date;
  createdBy?: string;
  modifiedBy?: string;
  creatorAvatar?: string;
  creatorDisplayName?: string;
}

export interface IClientReqDTO {
  name: string;
  description: string;
  logo: string;
  authentication_method: string;
  terms_url: string;
  policy_url: string;
  redirect_uris: string[];
  logout_redirect_uris: string[];
  scopes: string[];
  website_url: string;
  allowed_origins: string[];
}

export interface IClientResDTO {
  name: string;

  client_id: string;
  client_secret: string;

  description: string;
  logo: string;

  redirect_uris: string[];
  terms_url: string;
  policy_url: string;
  logout_redirect_uris: string[];

  authentication_method: string;

  scopes: string[];

  enabled: boolean;
  tenant: number;
  invalidated: boolean;
  website_url: string;
  allowed_origins: string[];

  created_on?: Date;
  modified_on?: Date;
  created_by?: string;
  modified_by?: string;
  creator_avatar?: string;
  creator_display_name?: string;
}

export interface IClientListProps {
  content: IClientProps[];
  page: number;
  next?: number;
  previous?: number;
  limit: number;
}

export interface IClientListDTO {
  data: IClientResDTO[];
  page: number;
  next?: number;
  previous?: number;
  limit: number;
}

export interface ISubmitReqDTO {
  client_id: string;
  state: string;
  scopes: string[];
}
