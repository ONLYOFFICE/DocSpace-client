import { ScopeGroup, ScopeType } from "./enums";
import {
  IClientResDTO,
  IClientReqDTO,
  IClientProps,
  IScope,
  IFilteredScopes,
} from "./interfaces";

export const transformToClientProps = (
  clientDto: IClientResDTO
): IClientProps => {
  const {
    client_id,
    client_secret,
    description,
    terms_url,
    policy_url,
    logo,
    authentication_method,
    redirect_uris,
    logout_redirect_uri,
    scopes,
    tenant,
    invalidated,
    name,
    enabled,
    created_on,
    created_by,
    modified_by,
    modified_on,
    website_url,
    allowed_origins,
    creator_avatar,
    creator_display_name,
  } = clientDto;

  const client: IClientProps = {
    clientId: client_id,
    clientSecret: client_secret,
    description,
    termsUrl: terms_url,
    policyUrl: policy_url,
    logo,
    authenticationMethod: authentication_method,
    redirectUris: redirect_uris,
    logoutRedirectUri: logout_redirect_uri,
    scopes,
    tenant,
    invalidated,
    name,
    enabled,
    createdBy: created_by,
    createdOn: created_on,
    modifiedBy: modified_by,
    modifiedOn: modified_on,
    websiteUrl: website_url,
    allowedOrigins: allowed_origins,
    creatorAvatar: creator_avatar,
    creatorDisplayName: creator_display_name,
  };

  return client;
};

export const transformToClientReqDTO = (
  clientProps: IClientProps
): IClientReqDTO => {
  const {
    name,
    description,
    termsUrl: terms_url,
    policyUrl: policy_url,
    logo,
    authenticationMethod,
    redirectUris: redirect_uris,
    logoutRedirectUri: logout_redirect_uri,
    scopes,
    websiteUrl,
    allowedOrigins,
  } = clientProps;

  const client: IClientReqDTO = {
    name,
    description,
    logo,
    redirect_uris,
    logout_redirect_uri,
    terms_url,
    policy_url,

    scopes,
    authentication_method: authenticationMethod,
    website_url: websiteUrl,
    allowed_origins: allowedOrigins,
  };

  return client;
};

export const getScopeTKeyDescription = (group: ScopeGroup, type: ScopeType) => {
  const tKey = `OAuth${group.replace(
    /^./,
    group[0].toUpperCase()
  )}${type.replace(/^./, type[0].toUpperCase())}Description`;

  return tKey;
};

export const getScopeTKeyName = (group: ScopeGroup) => {
  const tKey = `OAuth${group.replace(/^./, group[0].toUpperCase())}Name`;

  return tKey;
};

export const filterScopeByGroup = (
  checkedScopes: string[],
  scopes: IScope[]
) => {
  const filteredScopes: IFilteredScopes = {};

  scopes.forEach((scope) => {
    const isChecked = checkedScopes.includes(scope.name);
    const isRead = ScopeType.read === scope.type;

    const tKey = getScopeTKeyDescription(scope.group, scope.type);
    const read = isRead ? { ...scope, tKey } : ({} as IScope);
    const write = !isRead ? { ...scope, tKey } : ({} as IScope);

    if (filteredScopes[scope.group]) {
      if (isRead) {
        filteredScopes[scope.group].read = read;
        if (!filteredScopes[scope.group].isChecked && isChecked) {
          filteredScopes[scope.group].isChecked = isChecked;
          filteredScopes[scope.group].checkedType = ScopeType.read;
        }
      } else {
        filteredScopes[scope.group].write = write;
        if (isChecked) {
          filteredScopes[scope.group].isChecked = isChecked;
          filteredScopes[scope.group].checkedType = ScopeType.write;
        }
      }
    } else {
      filteredScopes[scope.group] = {
        isChecked,
        checkedType: isChecked ? scope.type : undefined,
        read,
        write,
      };
    }
  });

  return filteredScopes;
};
