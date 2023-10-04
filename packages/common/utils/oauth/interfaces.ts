export type Scope = {
  name: string;
  description: string;
};

export interface ClientProps {
  clientId: string;
  secret: string;

  name: string;
  description: string;
  logoUrl?: string;

  redirectUri: string;
  policyUrl: string;
  termsUrl: string;
  logoutRedirectUri: string;

  authenticationMethod: string;

  scopes: string[];

  enabled: boolean;
  tenant: number;
  invalidated?: boolean;
}

export interface ClientReqDTO {
  name: string;
  description: string;
  logo_url?: string;

  redirect_uri: string;
  policy_url: string;
  terms_url: string;
  logout_redirect_uri: string;

  scopes: string[];

  tenant: number;
}

export interface ClientResDTO {
  client_id: string;
  client_secret: string;

  name: string;
  description: string;
  logo_url?: string;

  redirect_uri: string;
  terms_url: string;
  policy_url: string;
  logout_redirect_uri: string;

  authentication_method: string;

  scopes: string[];

  enabled: boolean;
  tenant: number;
  invalidated?: boolean;
}

export interface ClientListProps {
  content: ClientProps[];
  empty: boolean;
  first: boolean;
  last: true;
  number: number;
  numberOfElements: number;
  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    unpaged: boolean;
  };
  size: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  totalElements: number;
  totalPages: number;
}

export type ClientListDTO = {
  content: ClientResDTO[];
  empty: boolean;
  first: boolean;
  last: true;
  number: number;
  numberOfElements: number;
  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    unpaged: boolean;
  };
  size: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  totalElements: number;
  totalPages: number;
};
