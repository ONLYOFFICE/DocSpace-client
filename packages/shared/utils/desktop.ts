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

import isEmpty from "lodash/isEmpty";
import omit from "lodash/omit";

import { toastr } from "../components/toast";
import type { Nullable, TTranslation } from "../types";
import type { TUser } from "../api/people/types";
import { ThemeKeys } from "../enums";

import { desktopConstants, getEditorTheme } from "./common";
import { checkIsSSR } from "./device";

const isSSR = checkIsSSR();

type TEncryptionKeys = {
  cryptoEngineId: string;
  privateKeyEnc?: string;
  publicKey?: string;
};

type TLoginData = {
  displayName: string | undefined;
  email: string | undefined;
  domain: string | boolean;
  provider: string;
  userId: string;
  uiTheme: string;
};

type TExtendedLoginData = TLoginData & {
  encryptionKeys?: TEncryptionKeys;
};

type TGetSharingKeysCallback = (data?: {
  keys?: Array<{ userId: string; publicKey: string }>;
}) => void;

export function regDesktop(
  user: TUser,
  isEncryption: boolean,
  keys?: { [key: string]: string | boolean },
  setEncryptionKeys?: (value: { [key: string]: string | boolean }) => void,
  isEditor?: boolean,
  getEncryptionAccess?: (callback?: TGetSharingKeysCallback) => void,
  t?: Nullable<TTranslation>,
): void {
  if (isSSR) return;

  const loginData: TLoginData = {
    displayName: user.displayName,
    email: user.email,
    domain: desktopConstants.domain,
    provider: desktopConstants.provider,
    userId: user.id,
    uiTheme: getEditorTheme(user.theme || ThemeKeys.BaseStr),
  };

  let extendedData: TExtendedLoginData = { ...loginData };

  if (isEncryption) {
    const encryptionKeys: TEncryptionKeys = {
      cryptoEngineId: desktopConstants.cryptoEngineId,
    };

    if (!isEmpty(keys)) {
      const filteredKeys = omit(keys, ["userId"]);
      Object.assign(encryptionKeys, filteredKeys);
    }

    extendedData = {
      ...loginData,
      encryptionKeys,
    };
  }

  window.AscDesktopEditor?.execCommand(
    "portal:login",
    JSON.stringify(extendedData),
  );

  window.cloudCryptoCommand = (type, params, callback) => {
    const handlers: Record<string, () => void> = {
      encryptionKeys: () => setEncryptionKeys?.(params),
      updateEncryptionKeys: () => setEncryptionKeys?.(params),
      relogin: () => reLogin(),
      getsharingkeys: () => {
        if (!isEditor || typeof getEncryptionAccess !== "function") {
          callback({});
          return;
        }
        getEncryptionAccess(callback as TGetSharingKeysCallback);
      },
    };

    handlers[type]?.();
  };

  window.onSystemMessage = (e) => {
    if (e.type !== "operation") return;

    const messages: Record<number, string | undefined> = {
      0: t?.("Common:EncryptionFilePreparing"),
      1: t?.("Common:EncryptingFile"),
    };

    const message =
      e.opMessage || messages[e.opType] || t?.("Common:LoadingProcessing");

    toastr.info(message);
  };
}

export function reLogin(): void {
  if (isSSR) return;

  setTimeout(() => {
    window.AscDesktopEditor?.execCommand(
      "portal:logout",
      JSON.stringify({
        domain: desktopConstants.domain,
        onsuccess: "reload",
      }),
    );
  }, 1000);
}

export function checkPwd(): void {
  if (isSSR) return;

  window.AscDesktopEditor?.execCommand(
    "portal:checkpwd",
    JSON.stringify({
      domain: desktopConstants.domain,
      emailInput: "login_username",
      pwdInput: "login_password",
    }),
  );
}

export function logout(): void {
  if (isSSR) return;

  window.AscDesktopEditor?.execCommand(
    "portal:logout",
    JSON.stringify({ domain: desktopConstants.domain }),
  );
}
