import { Nullable } from "../../types";
import { AuthenticationMethod, ScopeGroup, ScopeType } from "../../enums";

export type TScope = {
  name: string;
  group: ScopeGroup;
  type: ScopeType;
  tKey?: string;
};

export type TFilteredScopes = {
  [key: string]: {
    isChecked: boolean;
    checkedType?: ScopeType;
    read: TScope;
    write?: TScope;
  };
};

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

export type TConsentData = {
  client: TConsentClient;
  invalidated: boolean;
  modified_at: Date;
  principal_name: string;
  registered_client_id: string;
  scopes: string;
  is_public: boolean;
};

type List<T> = {
  data: T[];
  page: number;
  limit: number;
  next: Nullable<number>;
  previous: Nullable<number>;
};

export type IClientListProps = List<IClientProps>;

export type IClientListDTO = List<IClientResDTO>;

export type TConsentList = List<TConsentData>;

export type TGenerateDeveloperToken = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
};

export type TIntrospectDeveloperToken = {
  active: boolean;
  sub: string;
  aud: string[];
  nbf: string;
  scope: string;
  iss: string;
  exp: number;
  iat: number;
  jti: string;
  tid: number;
  cid: string;
  client_id: string;
  token_type: string;
};
