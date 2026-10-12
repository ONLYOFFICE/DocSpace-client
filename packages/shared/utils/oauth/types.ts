/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
