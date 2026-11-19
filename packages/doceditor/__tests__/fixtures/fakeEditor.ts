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

import type { Page } from "@playwright/test";

export type TFakeField = { id: string; key: string };

type TFakeEditorState = {
  forms: TFakeField[];
  config?: { events?: Record<string, (event?: object) => void> };
  // The next reads the editor does not answer.
  failReads: number;
  // How long the editor takes to answer a read.
  readDelay: number;
  reads: { isNoCalc?: boolean }[];
  connectors: number;
};

declare global {
  interface Window {
    __fakeEditor?: TFakeEditorState;
  }
}

// Stands in for the Document Server editor: the editor page finds DocsAPI defined and does not load api.js. The fields of
// the open form are what the test sets, and a connector command reads them through the same builder API the real editor
// gives it. Editor events come only when the test fires them.
export const installFakeEditor = async (page: Page) => {
  await page.addInitScript(() => {
    const state: TFakeEditorState = {
      forms: [],
      failReads: 0,
      readDelay: 0,
      reads: [],
      connectors: 0,
    };
    window.__fakeEditor = state;

    const connector = {
      callCommand(
        command: () => unknown,
        callback: (result: unknown) => void,
        isNoCalc?: boolean,
      ) {
        state.reads.push({ isNoCalc });

        if (state.failReads > 0) {
          state.failReads -= 1;
          setTimeout(() => callback(undefined), 0);
          return;
        }

        Object.assign(window, {
          Api: {
            GetDocument: () => ({
              GetAllForms: () =>
                state.forms.map((field) => ({
                  GetInternalId: () => field.id,
                  GetFormKey: () => field.key,
                })),
            }),
          },
        });
        const result = command();
        setTimeout(() => callback(result), state.readDelay);
      },
      executeMethod(
        _name: string,
        _params: object[],
        callback?: (response: object) => void,
      ) {
        callback?.({ error: "Not available in the fake editor" });
      },
      attachEvent() {},
      sendEvent() {},
      disconnect() {},
    };

    Object.assign(window, {
      DocsAPI: {
        DocEditor: (_id: string, config: TFakeEditorState["config"]) => {
          state.config = config;
          const noop = () => {};

          return {
            createConnector: () => {
              state.connectors += 1;
              return connector;
            },
            // Every co-editor left: the filling can start.
            startFilling: () =>
              setTimeout(() => state.config?.events?.onStartFilling?.(), 0),
            showMessage: noop,
            destroyEditor: noop,
            requestClose: noop,
            setFavorite: noop,
            setActionLink: noop,
            setUsers: noop,
            requestRoles: noop,
            refreshHistory: noop,
            setHistoryData: noop,
            insertImage: noop,
            setRequestedSpreadsheet: noop,
            setRequestedDocument: noop,
            setReferenceSource: noop,
            refreshFile: noop,
            denyEditingRights: noop,
            downloadAs: noop,
          };
        },
      },
    });
  });
};

export const setFormFields = (page: Page, forms: TFakeField[]) =>
  page.evaluate((fields) => {
    if (window.__fakeEditor) window.__fakeEditor.forms = fields;
  }, forms);

export const failNextReads = (page: Page, count: number) =>
  page.evaluate((n) => {
    if (window.__fakeEditor) window.__fakeEditor.failReads = n;
  }, count);

export const setReadDelay = (page: Page, ms: number) =>
  page.evaluate((delay) => {
    if (window.__fakeEditor) window.__fakeEditor.readDelay = delay;
  }, ms);

export const getEditorReads = (page: Page) =>
  page.evaluate(() => window.__fakeEditor?.reads ?? []);

export const getConnectorCount = (page: Page) =>
  page.evaluate(() => window.__fakeEditor?.connectors ?? 0);

// Fires an editor event at the handler the page gave the editor, which is the one of its first render.
export const fireEditorEvent = (page: Page, name: string, event?: object) =>
  page.evaluate(
    ([eventName, data]) => {
      const handler = window.__fakeEditor?.config?.events?.[eventName];
      // A handler may start a navigation; its result is not waited for.
      handler?.(data);
    },
    [name, event] as const,
  );

// Waits for the page to create the editor, then opens the form with the given fields.
export const openForm = async (page: Page, forms: TFakeField[]) => {
  await page.waitForFunction(() => !!window.__fakeEditor?.config);
  await setFormFields(page, forms);
  await fireEditorEvent(page, "onAppReady");
  await fireEditorEvent(page, "onDocumentReady");
};
