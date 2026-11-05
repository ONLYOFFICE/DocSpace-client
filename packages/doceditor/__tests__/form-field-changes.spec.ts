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

import type {
  SetupServer,
  WorkerFixture,
} from "@docspace/shared/__mocks__/e2e";

import {
  filesSettingsHandler,
  formFillingRecorder,
  openEditFormHandler,
  openEditHandler,
} from "@docspace/shared/__mocks__/handlers";
import type { TOpenEditFormOptions } from "@docspace/shared/__mocks__/handlers/editor/openedit";

import { expect, test } from "./fixtures/base";
import {
  failNextReads,
  fireEditorEvent,
  getConnectorCount,
  getEditorReads,
  installFakeEditor,
  openForm,
  setFormFields,
  setReadDelay,
  type TFakeField,
} from "./fixtures/fakeEditor";

type TFixtures = {
  page: Page;
  baseUrl: string;
  port: string;
  serverRequestInterceptor: SetupServer;
  clientRequestInterceptor: WorkerFixture;
};

// A snapshot read the editor did not answer is tried again after this long.
const SNAPSHOT_RETRY_DELAY = 3000;

// Records the reports and the filling starts the editor page sends; the reports are answered with the given statuses in
// turn, then with 200.
const recordRequests = (
  {
    port,
    clientRequestInterceptor,
  }: Pick<TFixtures, "port" | "clientRequestInterceptor">,
  fieldChangesStatuses: number[] = [],
) => {
  const recorder = formFillingRecorder(port, fieldChangesStatuses);
  clientRequestInterceptor.use(...recorder.handlers);
  return recorder;
};

const openEditor = async (
  { page, baseUrl, port, serverRequestInterceptor }: TFixtures,
  form?: TOpenEditFormOptions | "docx",
) => {
  serverRequestInterceptor.use(
    filesSettingsHandler(port),
    form === "docx" ? openEditHandler(port) : openEditFormHandler(port, form),
  );
  await page.goto(`${baseUrl}/doceditor?fileId=1`);
};

const field = (id: string, key: string): TFakeField => ({ id, key });

// The user changes the fields: the editor tells of a change at once.
const changeFields = async (page: Page, forms: TFakeField[]) => {
  await setFormFields(page, forms);
  await fireEditorEvent(page, "onDocumentStateChange", { data: true });
};

const saveDocument = (page: Page) =>
  fireEditorEvent(page, "onDocumentStateChange", { data: false });

// A request on its way as the page is left, or the trailing read of throttled changes, needs time.
const settle = (page: Page, ms = 500) => page.waitForTimeout(ms);

const leaveEditor = async (page: Page) => {
  await page.goto("about:blank");
  await settle(page);
};

test.describe("Form field changes", () => {
  test.beforeEach(async ({ page }) => {
    await installFakeEditor(page);
  });

  test.describe("Not tracked", () => {
    const cases: [string, TOpenEditFormOptions | "docx"][] = [
      ["A document that is not a form", "docx"],
      ["A filled form or a draft of the room", { edit: false }],
      ["A form opened for viewing", { mode: "view" }],
      ["A PDF form outside a form-filling room", { startFillingMode: 0 }],
    ];

    for (const [title, form] of cases) {
      test(`${title}: the fields are not read and nothing is sent`, async ({
        page,
        baseUrl,
        port,
        serverRequestInterceptor,
        clientRequestInterceptor,
      }) => {
        const fixtures: TFixtures = {
          page,
          baseUrl,
          port,
          serverRequestInterceptor,
          clientRequestInterceptor,
        };
        const { reports } = recordRequests(fixtures);
        await openEditor(fixtures, form);

        await openForm(page, [field("1", "name")]);
        await changeFields(page, [field("1", "fullName")]);
        await saveDocument(page);
        await settle(page);

        expect(await getEditorReads(page)).toEqual([]);
        await leaveEditor(page);
        expect(reports()).toEqual([]);
      });
    }
  });

  test("Opened and left without changes: nothing is sent", async ({
    page,
    baseUrl,
    port,
    serverRequestInterceptor,
    clientRequestInterceptor,
  }) => {
    const fixtures: TFixtures = {
      page,
      baseUrl,
      port,
      serverRequestInterceptor,
      clientRequestInterceptor,
    };
    const { reports } = recordRequests(fixtures);
    await openEditor(fixtures);

    await openForm(page, [field("1", "name"), field("2", "email")]);
    await saveDocument(page);
    await settle(page);
    await leaveEditor(page);

    expect(reports()).toEqual([]);
  });

  test("Field renamed: sent at once, read without recalculating the document, and only once", async ({
    page,
    baseUrl,
    port,
    serverRequestInterceptor,
    clientRequestInterceptor,
  }) => {
    const fixtures: TFixtures = {
      page,
      baseUrl,
      port,
      serverRequestInterceptor,
      clientRequestInterceptor,
    };
    const { reports } = recordRequests(fixtures);
    await openEditor(fixtures);

    await openForm(page, [field("1", "name"), field("2", "email")]);
    // The AI plugin of the editor keeps a connector of its own.
    const connectors = await getConnectorCount(page);
    await changeFields(page, [field("1", "fullName"), field("2", "email")]);

    await expect.poll(reports).toEqual([
      {
        version: 1,
        sequence: expect.any(Number),
        renames: [{ oldKey: "name", newKey: "fullName" }],
      },
    ]);

    // The save that follows the rename finds nothing new.
    await saveDocument(page);
    await settle(page);

    expect(reports()).toHaveLength(1);
    const reads = await getEditorReads(page);
    expect(reads.every((read) => read.isNoCalc === true)).toBe(true);
    expect(await getConnectorCount(page)).toBe(connectors);
  });

  test("Field renamed and the editor closed, the filling not started: the rename reaches the server once", async ({
    page,
    baseUrl,
    port,
    serverRequestInterceptor,
    clientRequestInterceptor,
  }) => {
    const fixtures: TFixtures = {
      page,
      baseUrl,
      port,
      serverRequestInterceptor,
      clientRequestInterceptor,
    };
    const { reports } = recordRequests(fixtures);
    await openEditor(fixtures);

    await openForm(page, [field("1", "name")]);
    await changeFields(page, [field("1", "fullName")]);
    await expect.poll(() => reports().length).toBe(1);

    await leaveEditor(page);

    expect(reports()).toEqual([
      expect.objectContaining({
        version: 1,
        renames: [{ oldKey: "name", newKey: "fullName" }],
      }),
    ]);
  });

  test("Report failed, then the editor closed: the rename goes as the page is left", async ({
    page,
    baseUrl,
    port,
    serverRequestInterceptor,
    clientRequestInterceptor,
  }) => {
    const fixtures: TFixtures = {
      page,
      baseUrl,
      port,
      serverRequestInterceptor,
      clientRequestInterceptor,
    };
    const { reports } = recordRequests(fixtures, [500]);
    await openEditor(fixtures);

    await openForm(page, [field("1", "name")]);
    await changeFields(page, [field("1", "fullName")]);
    await expect.poll(() => reports().length).toBe(1);

    await page.goto("about:blank");

    await expect.poll(() => reports().length).toBe(2);
    expect(reports()[1]).toEqual(reports()[0]);
  });

  test("Second rename right after the first, then the editor closed at once: the last rename reaches the server", async ({
    page,
    baseUrl,
    port,
    serverRequestInterceptor,
    clientRequestInterceptor,
  }) => {
    const fixtures: TFixtures = {
      page,
      baseUrl,
      port,
      serverRequestInterceptor,
      clientRequestInterceptor,
    };
    const { reports } = recordRequests(fixtures);
    await openEditor(fixtures);

    await openForm(page, [field("1", "name"), field("2", "email")]);
    await changeFields(page, [field("1", "fullName"), field("2", "email")]);
    await expect.poll(() => reports().length).toBe(1);

    // Within the read interval of the first rename.
    await changeFields(page, [field("1", "fullName"), field("2", "mail")]);
    await page.goto("about:blank");
    await settle(page);

    expect(reports().at(-1)?.renames).toEqual([
      { oldKey: "email", newKey: "mail" },
      { oldKey: "name", newKey: "fullName" },
    ]);
  });

  test("Opened, renamed, closed without starting the filling, then opened again: each session reports against the version it opened", async ({
    page,
    baseUrl,
    port,
    serverRequestInterceptor,
    clientRequestInterceptor,
  }) => {
    const fixtures: TFixtures = {
      page,
      baseUrl,
      port,
      serverRequestInterceptor,
      clientRequestInterceptor,
    };
    const { calls, reports } = recordRequests(fixtures);

    // First session, version 1.
    await openEditor(fixtures, { version: 1 });
    await openForm(page, [field("1", "fromWhom"), field("2", "email")]);
    await changeFields(page, [field("1", "applicant"), field("2", "email")]);
    await expect.poll(() => reports().length).toBe(1);
    await leaveEditor(page);

    // Second session: the save of the first is version 2, with the new key, and the editor gives the fields new ids.
    await openEditor(fixtures, { version: 2 });
    await openForm(page, [field("10", "applicant"), field("11", "email")]);
    await saveDocument(page);
    await settle(page);
    expect(reports()).toHaveLength(1);

    await changeFields(page, [
      field("10", "applicantName"),
      field("11", "email"),
    ]);
    await expect.poll(() => reports().length).toBe(2);

    await fireEditorEvent(page, "onRequestStartFilling");
    await expect
      .poll(() => calls.filter((call) => call.kind === "manageformfilling"))
      .toHaveLength(1);

    expect(reports()).toEqual([
      expect.objectContaining({
        version: 1,
        renames: [{ oldKey: "fromWhom", newKey: "applicant" }],
      }),
      expect.objectContaining({
        version: 2,
        renames: [{ oldKey: "applicant", newKey: "applicantName" }],
      }),
    ]);
  });

  test("Renamed, then renamed back: an empty report replaces the rename", async ({
    page,
    baseUrl,
    port,
    serverRequestInterceptor,
    clientRequestInterceptor,
  }) => {
    const fixtures: TFixtures = {
      page,
      baseUrl,
      port,
      serverRequestInterceptor,
      clientRequestInterceptor,
    };
    const { reports } = recordRequests(fixtures);
    await openEditor(fixtures);

    await openForm(page, [field("1", "name")]);
    await changeFields(page, [field("1", "fullName")]);
    await expect.poll(() => reports().length).toBe(1);

    await changeFields(page, [field("1", "name")]);

    await expect
      .poll(() => reports().at(-1)?.renames, { timeout: 2000 })
      .toEqual([]);
    expect(reports()[1].sequence).toBeGreaterThan(reports()[0].sequence);
  });

  test("Fields added, removed and moved: only the renamed one is reported", async ({
    page,
    baseUrl,
    port,
    serverRequestInterceptor,
    clientRequestInterceptor,
  }) => {
    const fixtures: TFixtures = {
      page,
      baseUrl,
      port,
      serverRequestInterceptor,
      clientRequestInterceptor,
    };
    const { reports } = recordRequests(fixtures);
    await openEditor(fixtures);

    await openForm(page, [
      field("1", "name"),
      field("2", "email"),
      field("3", "phone"),
    ]);
    // phone removed, comment added, email moved first, name renamed.
    await changeFields(page, [
      field("2", "email"),
      field("1", "fullName"),
      field("4", "comment"),
    ]);

    await expect.poll(reports).toEqual([
      expect.objectContaining({
        renames: [{ oldKey: "name", newKey: "fullName" }],
      }),
    ]);
  });

  test("Fields sharing a key renamed apart: the key is not reported", async ({
    page,
    baseUrl,
    port,
    serverRequestInterceptor,
    clientRequestInterceptor,
  }) => {
    const fixtures: TFixtures = {
      page,
      baseUrl,
      port,
      serverRequestInterceptor,
      clientRequestInterceptor,
    };
    const { reports } = recordRequests(fixtures);
    await openEditor(fixtures);

    await openForm(page, [field("1", "choice"), field("2", "choice")]);
    await changeFields(page, [field("1", "option"), field("2", "choice")]);
    await settle(page);

    expect(reports()).toEqual([]);
  });

  test("Filling started from the editor before the rename was read: the rename is reported first", async ({
    page,
    baseUrl,
    port,
    serverRequestInterceptor,
    clientRequestInterceptor,
  }) => {
    const fixtures: TFixtures = {
      page,
      baseUrl,
      port,
      serverRequestInterceptor,
      clientRequestInterceptor,
    };
    const { calls } = recordRequests(fixtures);
    await openEditor(fixtures);

    await openForm(page, [field("1", "name")]);
    await setFormFields(page, [field("1", "fullName")]);
    await fireEditorEvent(page, "onRequestStartFilling");

    await expect
      .poll(() => calls.map((call) => call.kind))
      .toEqual(["fieldchanges", "manageformfilling"]);
    expect(calls[1].body).toEqual(expect.objectContaining({ action: 2 }));
  });

  test("Report failing as the filling starts: the filling starts anyway", async ({
    page,
    baseUrl,
    port,
    serverRequestInterceptor,
    clientRequestInterceptor,
  }) => {
    const fixtures: TFixtures = {
      page,
      baseUrl,
      port,
      serverRequestInterceptor,
      clientRequestInterceptor,
    };
    const { calls } = recordRequests(fixtures, [500]);
    await openEditor(fixtures);

    await openForm(page, [field("1", "name")]);
    await setFormFields(page, [field("1", "fullName")]);
    await fireEditorEvent(page, "onRequestStartFilling");

    // The report that failed goes again as the editor leaves for the room.
    await expect
      .poll(() => calls.map((call) => call.kind).slice(0, 2))
      .toEqual(["fieldchanges", "manageformfilling"]);
  });

  test("Form refused by the server: nothing more is sent in the session", async ({
    page,
    baseUrl,
    port,
    serverRequestInterceptor,
    clientRequestInterceptor,
  }) => {
    const fixtures: TFixtures = {
      page,
      baseUrl,
      port,
      serverRequestInterceptor,
      clientRequestInterceptor,
    };
    const { reports } = recordRequests(fixtures, [403]);
    await openEditor(fixtures);

    await openForm(page, [field("1", "name")]);
    await changeFields(page, [field("1", "fullName")]);
    await expect.poll(() => reports().length).toBe(1);

    await changeFields(page, [field("1", "fullerName")]);
    await settle(page);
    await leaveEditor(page);

    expect(reports()).toHaveLength(1);
  });

  test("Many changes while the editor is slow to answer: one more read serves them all and finds the last rename", async ({
    page,
    baseUrl,
    port,
    serverRequestInterceptor,
    clientRequestInterceptor,
  }) => {
    const fixtures: TFixtures = {
      page,
      baseUrl,
      port,
      serverRequestInterceptor,
      clientRequestInterceptor,
    };
    const { reports } = recordRequests(fixtures);
    await openEditor(fixtures);

    await openForm(page, [field("1", "name")]);
    await expect.poll(async () => (await getEditorReads(page)).length).toBe(1);
    await setReadDelay(page, 1000);

    for (const key of ["n1", "n2", "n3", "n4", "n5"]) {
      await changeFields(page, [field("1", key)]);
    }
    await expect
      .poll(() => reports().at(-1)?.renames)
      .toEqual([{ oldKey: "name", newKey: "n5" }]);

    // The snapshot, the read the first change started and one for the changes that came while it was on its way.
    expect(await getEditorReads(page)).toHaveLength(3);
  });

  test("Editor busy as the form opens: the fields are read again and the rename is reported", async ({
    page,
    baseUrl,
    port,
    serverRequestInterceptor,
    clientRequestInterceptor,
  }) => {
    const fixtures: TFixtures = {
      page,
      baseUrl,
      port,
      serverRequestInterceptor,
      clientRequestInterceptor,
    };
    const { reports } = recordRequests(fixtures);
    await openEditor(fixtures);

    await page.waitForFunction(() => !!window.__fakeEditor?.config);
    await failNextReads(page, 1);
    await openForm(page, [field("1", "name")]);
    await settle(page, SNAPSHOT_RETRY_DELAY + 500);

    await changeFields(page, [field("1", "fullName")]);

    await expect.poll(reports).toEqual([
      expect.objectContaining({
        renames: [{ oldKey: "name", newKey: "fullName" }],
      }),
    ]);
  });
});
