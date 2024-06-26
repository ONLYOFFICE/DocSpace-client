import { Nullable } from "../../types";
import { AuthenticationMethod, ScopeGroup, ScopeType } from "../../enums";

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
    write?: IScope;
  };
}

export interface INoAuthClientProps {
  name: string;
  logo: string;
  websiteUrl: string;
  policyUrl?: string;
  termsUrl?: string;
  scopes?: string[];

  clientId?: undefined;
  clientSecret?: undefined;
  description?: undefined;

  authenticationMethods?: undefined;
  tenant?: undefined;
  redirectUris?: undefined;
  logoutRedirectUri?: undefined;
  enabled?: undefined;
  invalidated?: undefined;

  allowedOrigins?: undefined;
  createdOn?: undefined;
  modifiedOn?: undefined;
  createdBy?: undefined;
  modifiedBy?: undefined;
  creatorAvatar?: undefined;
  creatorDisplayName?: undefined;
}

export interface IClientProps {
  name: string;
  clientId: string;
  clientSecret: string;
  description: string;
  policyUrl: string;
  termsUrl: string;
  logo: string;
  authenticationMethods: AuthenticationMethod[];
  tenant: number;
  redirectUris: string[];
  logoutRedirectUri: string;
  enabled: boolean;
  invalidated: boolean;
  scopes: string[];
  websiteUrl: string;
  allowedOrigins: string[];
  createdOn: Date;
  modifiedOn: Date;
  createdBy: string;
  modifiedBy: string;
  creatorAvatar?: string;
  creatorDisplayName?: string;
  isPublic: boolean;
}

export interface IClientReqDTO {
  name: string;
  description: string;
  logo: string;
  allow_pkce: boolean;
  terms_url: string;
  policy_url: string;
  redirect_uris: string[];
  logout_redirect_uri: string;
  scopes: string[];
  website_url: string;
  allowed_origins: string[];
  is_public: boolean;
}

export interface IClientResDTO {
  allowed_origins: string[];
  authentication_methods: AuthenticationMethod[];

  client_id: string;
  client_secret: string;

  created_by: string;
  created_on: Date;

  creator_avatar?: string;
  creator_display_name?: string;

  description: string;

  enabled: boolean;
  invalidated: boolean;
  is_public: boolean;

  logo: string;
  logout_redirect_uri: string;

  modified_by: string;
  modified_on: Date;

  name: string;

  policy_url: string;
  redirect_uris: string[];

  scopes: string[];

  terms_url: string;
  tenant: number;

  website_url: string;
}

export interface IClientListProps {
  content: IClientProps[];
  page: number;
  limit: number;
  next: Nullable<number>;
  previous: Nullable<number>;
}

export interface IClientListDTO {
  data: IClientResDTO[];
  page: number;
  limit: number;
  next: Nullable<number>;
  previous: Nullable<number>;
}

export interface ISubmitReqDTO {
  client_id: string;
  state: string;
  scopes: string[];
}

export type TConsentClient = {
  authentication_methods: AuthenticationMethod[];
  client_id: string;
  created_by: string;
  created_on: Date;
  description: string;
  enabled: boolean;
  invalidated: boolean;
  tenant: number;
  tenant_url: string;
  terms_url: string;
  website_url: string;
  modified_by: string;
  modified_on: Date;
  name: string;
  policy_url: string;
  logo: string;
  links: string[];
  logout_redirect_uris: string[];
  redirect_uris: string[];
  scopes: string[];
  allowed_origins: string[];
  is_public: boolean;
};

export interface IGetConsentList {
  client: TConsentClient;
  invalidated: boolean;
  modified_at: Date;
  principal_name: string;
  registered_client_id: string;
  scopes: string;
  is_public: boolean;
}
