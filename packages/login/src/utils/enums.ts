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

export enum MessageKey {
  "None",
  "Error",
  "ErrorUserNotFound",
  "ErrorExpiredActivationLink",
  "ErrorInvalidActivationLink",
  "ErrorConfirmURLError",
  "ErrorNotCorrectEmail",
  "LoginWithBruteForce",
  "RecaptchaInvalid",
  "LoginWithAccountNotFound",
  "InvalidUsernameOrPassword",
  "SsoSettingsDisabled",
  "ErrorNotAllowedOption",
  "SsoSettingsEmptyToken",
  "SsoSettingsNotValidToken",
  "SsoSettingsCantCreateUser",
  "SsoSettingsUserTerminated",
  "SsoError",
  "SsoAuthFailed",
  "SsoAttributesNotFound",
  "QuotaPaidUserLimitError",
  "InvalidLink",
}

export enum OAuth2ErrorKey {
  asc_retrieval_error = "asc_retrieval_error",
  client_disabled_error = "client_disabled_error",
  client_not_found_error = "client_not_found_error",
  client_permission_denied_error = "client_permission_denied_error",
  missing_asc_cookie_error = "missing_asc_signature_error",
  missing_client_id_error = "missing_client_id_error",
  something_went_wrong_error = "something_went_wrong_error",
}

export const enum AuthenticatedAction {
  None = 0,
  Logout = 1,
  Redirect = 2,
}

/**
 * Enum for result of validation confirm link.
 * @readonly
 */
export const enum ValidationResult {
  Ok = 0,
  Invalid = 1,
  Expired = 2,
  TariffLimit = 3,
  UserExisted = 4,
  UserExcluded = 5,
  QuotaFailed = 6,
}
