// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import EnUSReactSvgUrl from "PUBLIC_DIR/images/flags/en-US.react.svg?url";

/**
 * Enum for type of confirm link.
 * @readonly
 */
export const ConfirmType = Object.freeze({
  EmpInvite: 0,
  LinkInvite: 1,
  PortalSuspend: 2,
  PortalContinue: 3,
  PortalRemove: 4,
  DnsChange: 5,
  PortalOwnerChange: 6,
  Activation: 7,
  EmailChange: 8,
  EmailActivation: 9,
  PasswordChange: 10,
  ProfileRemove: 11,
  PhoneActivation: 12,
  PhoneAuth: 13,
  Auth: 14,
  TfaActivation: 15,
  TfaAuth: 16,
});

/**
 * Enum for result of validation public room keys.
 * @readonly
 */

export const GUID_EMPTY = "00000000-0000-0000-0000-000000000000";
export const ID_NO_GROUP_MANAGER = "4a515a15-d4d6-4b8e-828e-e0586f18f3a3";

/**
 * Enum for table columns version
 * @readonly
 */
export const TableVersions = Object.freeze({
  Rooms: "3",
  Files: "3",
  People: "3",
  Trash: "5",
  Groups: "6",
  InsideGroup: "6",
  Recent: "2",
  Favorites: "1",
  Guests: "1",
  SharedWithMe: "1",
});

/**
 * Enum for quotas bar
 * @readonly
 */
export const QuotaBarTypes = Object.freeze({
  ConfirmEmail: "confirm-email",
  RoomsTariff: "room-quota",
  RoomsTariffLimit: "room-quota-limit",
  StorageTariff: "storage-quota",
  StorageTariffLimit: "storage-quota-limit",
  UsersTariff: "user-quota",
  UsersTariffLimit: "user-quota-limit",
  UserAndStorageTariff: "user-storage-quota",
  UserAndStorageTariffLimit: "user-storage-quota-limit",
  RoomsAndStorageTariff: "room-storage-quota",
  RoomsAndStorageTariffLimit: "room-storage-quota-limit",
  PersonalUserQuota: "personal-user-quota",
  StorageQuota: "tenant-custom-quota",
  StorageQuotaLimit: "tenant-custom-quota-limit",
});

export const BINDING_POST = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST";
export const BINDING_REDIRECT =
  "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect";
export const SSO_NAME_ID_FORMAT = [
  "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified",
  "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
  "urn:oasis:names:tc:SAML:2.0:nameid-format:entity",
  "urn:oasis:names:tc:SAML:2.0:nameid-format:transient",
  "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent",
  "urn:oasis:names:tc:SAML:2.0:nameid-format:encrypted",
  "urn:oasis:names:tc:SAML:2.0:nameid-format:unspecified",
  "urn:oasis:names:tc:SAML:1.1:nameid-format:X509SubjectName",
  "urn:oasis:names:tc:SAML:1.1:nameid-format:WindowsDomainQualifiedName",
  "urn:oasis:names:tc:SAML:2.0:nameid-format:kerberos",
];
export const SSO_GIVEN_NAME = "givenName";
export const SSO_SN = "sn";
export const SSO_EMAIL = "email";
export const SSO_LOCATION = "location";
export const SSO_TITLE = "title";
export const SSO_PHONE = "phone";
export const SSO_SIGNING = "signing";
export const SSO_ENCRYPT = "encrypt";
export const SSO_SIGNING_ENCRYPT = "signing and encrypt";

export const DEFAULT_SELECT_TIMEZONE = {
  key: "UTC",
  label: "(UTC) Coordinated Universal Time",
};

export const DEFAULT_SELECT_LANGUAGE = {
  key: "en-US",
  label: "English (United States)",
  icon: EnUSReactSvgUrl,
};

export const LinkType = Object.freeze({
  Invite: 0,
  External: 1,
});

/**
 * Enum for sort by field name
 * @readonly
 */
export const SortByFieldName = Object.freeze({
  Name: "AZ",
  ModifiedDate: "DateAndTime",
  CreationDate: "DateAndTimeCreation",
  Author: "Author",
  Size: "Size",
  Type: "Type",
  Room: "Room",
  Tags: "Tags",
  RoomType: "roomType",
  LastOpened: "LastOpened",
  UsedSpace: "usedspace",
});

export const ThirdPartyServicesUrlName = Object.freeze({
  GoogleDrive: "google",
  Box: "box",
  Dropbox: "dropbox",
  OneDrive: "skydrive",
  Nextcloud: "nextcloud",
  kDrive: "kdrive",
  ownCloud: "owncloud",
  WebDav: "webdav",
});

export const TABLE_ROOMS_COLUMNS = `roomsTableColumns_ver-${TableVersions.Rooms}`;
export const TABLE_PEOPLE_COLUMNS = `peopleTableColumns_ver-${TableVersions.People}`;
