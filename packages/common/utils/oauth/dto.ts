export type ScopeDTO = {
  name: string;
  description: string;
};

export interface ClientProps {
  clientId: string;
  secret: string;
  description: string;
  termsUrl: string;
  policyUrl: string;
  logoUrl: string;
  authenticationMethod: string;
  redirectUri: string;
  logoutRedirectUri: string;
  scopes: string[];
  tenant: number;
  invalidated?: boolean;
  name: string;
}

export type ClientDTO = {
  client_id: string;
  client_secret: string;
  description: string;
  terms_url: string;
  policy_url: string;
  logo_url: string;
  authenticationMethod: string;
  redirect_uri: string;
  logout_redirect_uri: string;
  scopes: string[];
  tenant: number;
  invalidated?: boolean;
  name: string;
};

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
  content: ClientDTO[];
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
