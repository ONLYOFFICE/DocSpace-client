import { ClientDTO, ClientProps } from "./dto";

export const transformToClientProps = (clientDto: ClientDTO): ClientProps => {
  const {
    client_id,
    client_secret,
    description,
    terms_url,
    policy_url,
    logo_url,
    authenticationMethod,
    redirect_uri,
    logout_redirect_uri,
    scopes,
    tenant,
    invalidated,
    name,
  } = clientDto;

  const client: ClientProps = {
    clientId: client_id,
    secret: client_secret,
    description,
    termsUrl: terms_url,
    policyUrl: policy_url,
    logoUrl: logo_url,
    authenticationMethod,
    redirectUri: redirect_uri,
    logoutRedirectUri: logout_redirect_uri,
    scopes,
    tenant,
    invalidated,
    name,
  };

  return client;
};

export const transformToClientDTO = (clientProps: ClientProps): ClientDTO => {
  const {
    clientId: client_id,
    secret: client_secret,
    description,
    termsUrl: terms_url,
    policyUrl: policy_url,
    logoUrl: logo_url,
    authenticationMethod,
    redirectUri: redirect_uri,
    logoutRedirectUri: logout_redirect_uri,
    scopes,
    tenant,
    invalidated,
    name,
  } = clientProps;

  const client: ClientDTO = {
    client_id,
    client_secret,
    description,
    terms_url,
    policy_url,
    logo_url,
    authenticationMethod,
    redirect_uri,
    logout_redirect_uri,
    scopes,
    tenant,
    invalidated,
    name,
  };

  return client;
};
