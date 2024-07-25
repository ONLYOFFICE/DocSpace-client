/* eslint-disable @typescript-eslint/naming-convention */
import crypto from "crypto-js";
import sha256 from "crypto-js/sha256";

import { AuthenticationMethod, ScopeGroup, ScopeType } from "../../enums";
import {
  IClientResDTO,
  IClientReqDTO,
  IClientProps,
  TScope,
  TFilteredScopes,
} from "./types";

export const transformToClientProps = (
  clientDto: IClientResDTO,
): IClientProps => {
  const {
    client_id,
    client_secret,
    description,
    terms_url,
    policy_url,
    logo,
    authentication_methods,
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
    is_public,
  } = clientDto;

  const client: IClientProps = {
    clientId: client_id,
    clientSecret: client_secret,
    description,
    termsUrl: terms_url,
    policyUrl: policy_url,
    logo,
    authenticationMethods: authentication_methods,
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
    isPublic: is_public,
  };

  return client;
};

export const transformToClientReqDTO = (
  clientProps: IClientProps,
): IClientReqDTO => {
  const {
    name,
    description,
    termsUrl: terms_url,
    policyUrl: policy_url,
    logo,
    authenticationMethods,
    redirectUris: redirect_uris,
    logoutRedirectUri: logout_redirect_uri,
    scopes,
    websiteUrl,
    allowedOrigins,
    isPublic,
  } = clientProps;

  const client: IClientReqDTO = {
    name,
    description,
    logo,
    redirect_uris,
    logout_redirect_uri,
    terms_url,
    policy_url,
    is_public: isPublic,
    scopes,
    allow_pkce: authenticationMethods.includes(AuthenticationMethod.none),
    website_url: websiteUrl,
    allowed_origins: allowedOrigins,
  };

  return client;
};

export const getScopeTKeyDescription = (group: ScopeGroup, type: ScopeType) => {
  const tKey = `OAuth${group.replace(
    /^./,
    group[0].toUpperCase(),
  )}${type.replace(/^./, type[0].toUpperCase())}Description`;

  return tKey;
};

export const getScopeTKeyName = (group: ScopeGroup) => {
  const tKey = `OAuth${group.replace(/^./, group[0].toUpperCase())}Name`;

  return tKey;
};

export const filterScopeByGroup = (
  checkedScopes: string[],
  scopes: TScope[],
) => {
  const filteredScopes: TFilteredScopes = {};

  scopes.forEach((scope) => {
    const isChecked = checkedScopes.includes(scope.name);
    const isRead = ScopeType.read === scope.type;

    const tKey = getScopeTKeyDescription(scope.group, scope.type);
    const read = isRead ? { ...scope, tKey } : ({} as TScope);
    const write = !isRead ? { ...scope, tKey } : ({} as TScope);

    if (scope.group === ScopeGroup.openid) {
      filteredScopes[scope.group] = {
        isChecked,
        checkedType: isChecked ? scope.type : undefined,
        read: write,
        write: undefined,
      };

      return;
    }

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

export function generatePKCEPair() {
  const NUM_OF_BYTES = 36; // Total of 44 characters (1 Bytes = 2 char) (standard states that: 43 chars <= verifier <= 128 chars)
  // const HASH_ALG = "sha256";

  const randomVerifier = crypto.lib.WordArray.random(NUM_OF_BYTES).toString();
  const randomState = crypto.lib.WordArray.random(NUM_OF_BYTES).toString();
  const hash = sha256(randomVerifier).toString(crypto.enc.Base64);

  return { verifier: randomVerifier, challenge: hash, state: randomState };
}
