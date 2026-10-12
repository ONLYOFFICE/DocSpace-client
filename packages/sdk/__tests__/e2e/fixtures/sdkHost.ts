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

import type { FrameLocator, Page } from "@playwright/test";

const FRAME_ID = "ds-frame";
const HOST_PATH = "/__sdk-host";

type THostWindow = Window & {
  __sdkEvents: { event: string; data: unknown }[];
  __sdkCall: (methodName: string, data?: unknown) => Promise<unknown>;
};

const hostPage = (framePath: string, config: object) => `<!doctype html>
<html>
  <body style="margin:0">
    <iframe
      id="${FRAME_ID}"
      name="frameDocSpace__#${FRAME_ID}"
      src="${framePath}"
      style="width:1280px;height:720px;border:0"
    ></iframe>
    <script>
      const config = ${JSON.stringify(config)};
      const frame = document.getElementById("${FRAME_ID}");
      const replies = new Map();
      let lastCallId = 0;

      window.__sdkEvents = [];

      const send = (methodName, data) => {
        const callId = ++lastCallId;
        const message = { methodName, data, callId };
        frame.contentWindow.postMessage(
          JSON.stringify({ frameId: "${FRAME_ID}", type: "", callId, data: message }),
          "*",
        );
        return callId;
      };

      window.__sdkCall = (methodName, data) =>
        new Promise((resolve) => {
          const callId = send(methodName, data);
          replies.set(callId, resolve);
        });

      window.addEventListener("message", (e) => {
        if (e.source !== frame.contentWindow || typeof e.data !== "string") return;

        let message;
        try {
          message = JSON.parse(e.data);
        } catch {
          return;
        }

        if (message.type === "onCallCommand" && message.commandName === "setConfig") {
          send("setConfig", { ...config, frameId: "${FRAME_ID}" });
        } else if (message.type === "onEventReturn") {
          window.__sdkEvents.push(message.eventReturnData);
        } else if (message.type === "onMethodReturn" && replies.has(message.callId)) {
          replies.get(message.callId)(message.methodReturnData);
          replies.delete(message.callId);
        }
      });
    </script>
  </body>
</html>`;

export const openInSdkHost = async (
  page: Page,
  baseUrl: string,
  framePath: string,
  config: object,
): Promise<FrameLocator> => {
  await page.route(`${baseUrl}${HOST_PATH}`, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: hostPage(framePath, config),
    }),
  );

  await page.goto(`${baseUrl}${HOST_PATH}`);

  await page.waitForFunction(() =>
    (window as unknown as THostWindow).__sdkEvents.some(
      (item) => item.event === "onAppReady",
    ),
  );

  return page.frameLocator(`#${FRAME_ID}`);
};

export const callSdkMethod = (page: Page, methodName: string, data?: unknown) =>
  page.evaluate(
    ([name, payload]) =>
      (window as unknown as THostWindow).__sdkCall(name as string, payload),
    [methodName, data] as const,
  );

export const readSdkEvents = (page: Page, event: string) =>
  page.evaluate(
    (name) =>
      (window as unknown as THostWindow).__sdkEvents
        .filter((item) => item.event === name)
        .map((item) => item.data),
    event,
  );
