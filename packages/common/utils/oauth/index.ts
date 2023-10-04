import { ClientResDTO, ClientReqDTO, ClientProps } from "./interfaces";

export const transformToClientProps = (
  clientDto: ClientResDTO
): ClientProps => {
  const {
    client_id,
    client_secret,
    description,
    terms_url,
    policy_url,
    logo_url,
    authentication_method,
    redirect_uri,
    logout_redirect_uri,
    scopes,
    tenant,
    invalidated,
    name,
    enabled,
  } = clientDto;

  const client: ClientProps = {
    clientId: client_id,
    secret: client_secret,
    description,
    termsUrl: terms_url,
    policyUrl: policy_url,
    logoUrl: logo_url,
    authenticationMethod: authentication_method,
    redirectUri: redirect_uri,
    logoutRedirectUri: logout_redirect_uri,
    scopes,
    tenant,
    invalidated,
    name,
    enabled,
  };

  return client;
};

export const transformToClientReqDTO = (
  clientProps: ClientProps
): ClientReqDTO => {
  const {
    name,
    description,
    termsUrl: terms_url,
    policyUrl: policy_url,
    logoUrl: logo_url,
    authenticationMethod,
    redirectUri: redirect_uri,
    logoutRedirectUri: logout_redirect_uri,
    scopes,
    tenant,
  } = clientProps;

  const client: ClientReqDTO = {
    name,
    description,
    logo_url,

    redirect_uri,
    logout_redirect_uri,
    terms_url,
    policy_url,

    scopes,

    tenant,
  };

  return client;
};
