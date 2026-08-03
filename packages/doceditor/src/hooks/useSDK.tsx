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

import { useEffect, useCallback, useState } from "react";
import merge from "lodash/merge";

import {
  frameCallbackData,
  frameCallCommand,
  frameHandlePing,
} from "@docspace/shared/utils/common";
import { applyCustomStyles } from "@docspace/shared/utils/customStyles";
import { EDITOR_ID } from "@docspace/shared/constants";
import { TFrameConfig } from "@docspace/shared/types/Frame";

const useSDK = (baseSdkConfig?: TFrameConfig) => {
  const [sdkConfig, setSdkConfig] = useState<TFrameConfig | undefined>(
    baseSdkConfig,
  );

  const handleMessage = useCallback(
    (e: MessageEvent) => {
      if (window.self === window.parent || e.source !== window.parent) return;

      const eventData =
        typeof e.data === "string" ? JSON.parse(e.data) : e.data;

      if (frameHandlePing(eventData)) return;

      if (eventData.data) {
        const { data, methodName, callId } = eventData.data;

        if (!methodName) return;

        let res;

        try {
          switch (methodName) {
            case "setConfig": {
              const newConfig = merge(baseSdkConfig, data);
              setSdkConfig(newConfig);
              applyCustomStyles(newConfig?.stylesUrl);
              res = newConfig;
              break;
            }
            case "executeInEditor": {
              const instance = window.DocEditor?.instances[EDITOR_ID];
              const asc = window.Asc;

              try {
                const cFn = new Function(
                  "instance",
                  "asc",
                  "data",
                  `const c = ${data.callback}; c(instance, asc, data);`,
                );

                cFn(instance, asc, data.data);
              } catch (err) {
                console.error("Error executing editor callback:", err);
              }

              break;
            }
            default:
              res = "Wrong method for this mode";
          }
        } catch (err) {
          res = err as Error;
        }

        frameCallbackData(res, callId);
      }
    },
    [setSdkConfig, baseSdkConfig],
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage, false);

    return () => {
      window.removeEventListener("message", handleMessage, false);
    };
  }, [handleMessage]);

  const callSetConfig = useCallback(() => {
    frameCallCommand("setConfig", { src: window.location.origin });
  }, []);

  useEffect(() => {
    if (window.parent && !sdkConfig?.frameId) {
      callSetConfig();
    }
  }, [sdkConfig?.frameId, callSetConfig]);

  return { sdkConfig };
};

export default useSDK;
