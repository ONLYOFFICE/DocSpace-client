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

import isEmpty from "lodash/isEmpty";
import omit from "lodash/omit";

import { toastr } from "@docspace/ui-kit/components/toast";
import type { Nullable, TTranslation } from "../types";
import type { TUser } from "../api/people/types";
import { ThemeKeys } from "@docspace/ui-kit/enums";

import { desktopConstants, getEditorTheme } from "./common";
import { checkIsSSR } from "@docspace/ui-kit/utils/device";
import { createApiKey } from "../api/api-keys";
import type { TApiKeyRequest } from "../api/api-keys/types";

const isSSR = checkIsSSR();

export async function regDesktop(
  user: TUser,
  isEncryption: boolean,
  keys?: { [key: string]: string | boolean },
  setEncryptionKeys?: (value: { [key: string]: string | boolean }) => void,
  isEditor?: boolean,
  getEncryptionAccess?: (
    callback?: (data: { keys: { [key: string]: string | boolean } }) => void,
  ) => void,
  t?: Nullable<TTranslation>,
) {
  if (!isSSR) {
    const data = {
      displayName: user.displayName,
      email: user.email,
      domain: desktopConstants.domain,
      provider: desktopConstants.provider,
      userId: user.id,
      uiTheme: getEditorTheme(user.theme),
    };

    let extendedData;

    if (isEncryption) {
      extendedData = {
        ...data,
        encryptionKeys: {
          cryptoEngineId: desktopConstants.cryptoEngineId,
        },
      };

      if (!isEmpty(keys)) {
        const filteredKeys = omit(keys, ["userId"]);
        extendedData = {
          ...extendedData,
          encryptionKeys: { ...extendedData.encryptionKeys, ...filteredKeys },
        };
      }
    } else {
      extendedData = { ...data };
    }

    if (window.AscDesktopEditor?.getCloudKeys) {
      const desktopKeys =
        window.AscDesktopEditor.getCloudKeys(
          desktopConstants.domain as string,
        ) ?? [];

      if (desktopKeys.length === 0) {
        try {
          const apiKey = await createApiKey({
            name: "Desktop Editor",
            permissions: ["*"],
          } as TApiKeyRequest);
          extendedData = {
            ...extendedData,
            apiKey: { id: apiKey.id, name: apiKey.name, key: apiKey.key },
          };
        } catch (e) {
          console.error("Failed to create API key for desktop editor", e);
        }
      }
    }

    window.AscDesktopEditor?.execCommand(
      "portal:login",
      JSON.stringify(extendedData),
    );

    if (isEncryption) {
      window.cloudCryptoCommand = (type, params, callback) => {
        switch (type) {
          case "encryptionKeys": {
            setEncryptionKeys?.(params);
            break;
          }
          case "updateEncryptionKeys": {
            setEncryptionKeys?.(params);
            break;
          }
          case "relogin": {
            // toastr.info(t("Common:EncryptionKeysReload"));
            // relogin();
            break;
          }
          case "getsharingkeys":
            if (!isEditor || typeof getEncryptionAccess !== "function") {
              callback({});
              return;
            }
            getEncryptionAccess(callback);
            break;
          default:
            break;
        }
      };
    }

    window.onSystemMessage = (e) => {
      let message = e.opMessage;
      switch (e.type) {
        case "operation":
          if (!message) {
            switch (e.opType) {
              case 0:
                message = t?.("Common:EncryptionFilePreparing");
                break;
              case 1:
                message = t?.("Common:EncryptingFile");
                break;
              default:
                message = t?.("Common:LoadingProcessing");
            }
          }
          toastr.info(message);
          break;
        default:
          break;
      }
    };
  }
}

export function relogin() {
  if (!isSSR)
    setTimeout(() => {
      const data = {
        domain: desktopConstants.domain,
        onsuccess: "reload",
      };
      window.AscDesktopEditor?.execCommand(
        "portal:logout",
        JSON.stringify(data),
      );
    }, 1000);
}

export function checkPwd() {
  if (!isSSR) {
    const data = {
      domain: desktopConstants.domain,
      emailInput: "login",
      pwdInput: "password",
    };
    window.AscDesktopEditor?.execCommand(
      "portal:checkpwd",
      JSON.stringify(data),
    );
  }
}

export function logout() {
  if (!isSSR) {
    const data = {
      domain: desktopConstants.domain,
    };
    window.AscDesktopEditor?.execCommand("portal:logout", JSON.stringify(data));
  }
}
