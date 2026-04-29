// (c) Copyright Ascensio System SIA 2009-2026
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
