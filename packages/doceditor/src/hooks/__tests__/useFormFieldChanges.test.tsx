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

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

type TForm = { GetInternalId?: () => unknown; GetFormKey?: () => unknown };

const { editor } = vi.hoisted(() => ({
  editor: {
    forms: [] as TForm[],
    createConnector: vi.fn(),
    callCommand: vi.fn(),
    disconnect: vi.fn(),
  },
}));

vi.mock("@docspace/shared/api/files", () => ({
  reportFormFieldChanges: vi.fn(async () => undefined),
}));

vi.mock("@/utils", () => ({
  getDocEditor: () => ({ createConnector: editor.createConnector }),
}));

import { reportFormFieldChanges } from "@docspace/shared/api/files";

import useFormFieldChanges from "../useFormFieldChanges";

const report = vi.mocked(reportFormFieldChanges);

const form = (id: string | undefined, key: string): TForm => ({
  ...(id !== undefined && { GetInternalId: () => id }),
  GetFormKey: () => key,
});

const setForms = (...forms: TForm[]) => {
  editor.forms = forms;
};

const httpError = (status: number) =>
  Object.assign(new Error(`status ${status}`), { response: { status } });

describe("useFormFieldChanges", () => {
  let root: Root | null = null;
  let hook: ReturnType<typeof useFormFieldChanges>;

  const Probe = ({
    fileId,
    version,
    enabled,
  }: {
    fileId?: number;
    version?: number;
    enabled: boolean;
  }) => {
    hook = useFormFieldChanges(fileId, version, enabled);
    return null;
  };

  const render = (enabled = true) => {
    root = createRoot(document.createElement("div"));
    act(() => root?.render(<Probe fileId={7} version={3} enabled={enabled} />));
  };

  // A snapshot whose reads fail waits between its tries; the wait passes at once.
  const takeSnapshotWithRetries = async () => {
    vi.useFakeTimers();
    try {
      const done = hook.takeSnapshot();
      await vi.runAllTimersAsync();
      await done;
    } finally {
      vi.useRealTimers();
    }
  };

  // The editor does not tell the fields on the next read.
  const failNextRead = () =>
    editor.callCommand.mockImplementationOnce(
      (_command: () => unknown, callback: (result: unknown) => void) =>
        callback(null),
    );

  beforeEach(() => {
    // The command runs as the editor would run it: against the builder API of the open document.
    (globalThis as { Api?: object }).Api = {
      GetDocument: () => ({ GetAllForms: () => editor.forms }),
    };
    editor.callCommand.mockImplementation(
      (command: () => unknown, callback: (result: unknown) => void) =>
        callback(command()),
    );
    editor.createConnector.mockImplementation(() => ({
      callCommand: editor.callCommand,
      disconnect: editor.disconnect,
    }));
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    delete (globalThis as { Api?: object }).Api;
    vi.mocked(console.error).mockRestore();
  });

  it("Tracking off (not the original form of a form-filling room, or Community Edition editors): the editor is not asked and nothing is sent", async () => {
    render(false);
    setForms(form("1", "name"));

    await hook.takeSnapshot();
    setForms(form("1", "fullName"));
    await hook.reportFieldChanges();

    expect(editor.createConnector).not.toHaveBeenCalled();
    expect(report).not.toHaveBeenCalled();
  });

  it("Callbacks kept from the first render, before the file was known: they report the form as it is now", async () => {
    root = createRoot(document.createElement("div"));
    act(() => root?.render(<Probe enabled={false} />));
    // The editor holds on to the callbacks it got first.
    const first = hook;

    act(() => root?.render(<Probe fileId={7} version={3} enabled />));
    setForms(form("1", "name"));
    await first.takeSnapshot();

    setForms(form("1", "fullName"));
    first.scheduleFieldChanges(true);
    await hook.reportFieldChanges();

    expect(report).toHaveBeenCalledWith(7, {
      version: 3,
      sessionId: expect.any(String),
      sequence: expect.any(Number),
      renames: [{ oldKey: "name", newKey: "fullName" }],
    });
    expect(first.scheduleFieldChanges).toBe(hook.scheduleFieldChanges);
  });

  it("Field renamed: the old and the new key of that field are reported, read without recalculating the document", async () => {
    render();
    setForms(form("1", "name"), form("2", "email"));
    await hook.takeSnapshot();

    setForms(form("1", "fullName"), form("2", "email"), form("3", "phone"));
    await hook.reportFieldChanges();

    expect(report).toHaveBeenCalledTimes(1);
    expect(report).toHaveBeenCalledWith(7, {
      version: 3,
      sessionId: expect.any(String),
      sequence: expect.any(Number),
      renames: [{ oldKey: "name", newKey: "fullName" }],
    });
    expect(editor.callCommand).toHaveBeenLastCalledWith(
      expect.any(Function),
      expect.any(Function),
      true,
    );
  });

  it("Reports of one session, as the document changes and as the editor is left: they carry one session id", async () => {
    render();
    setForms(form("1", "name"), form("2", "email"));
    await hook.takeSnapshot();

    setForms(form("1", "fullName"), form("2", "email"));
    await hook.reportFieldChanges();
    report.mockRejectedValueOnce(httpError(500));
    setForms(form("1", "fullName"), form("2", "mail"));
    await hook.reportFieldChanges();
    window.dispatchEvent(new Event("pagehide"));

    expect(report).toHaveBeenCalledTimes(3);
    const [first, ...rest] = report.mock.calls.map(([, data]) => data.sessionId);
    // What the server takes: letters, digits, hyphens and underscores, 64 at most.
    expect(first).toMatch(/^[A-Za-z0-9_-]{1,64}$/);
    expect(rest).toEqual([first, first]);
  });

  it("Editor opened again on the version not saved yet: the new session has an id of its own", async () => {
    // The first session renames a field and is left before the version is saved.
    render();
    setForms(form("1", "name"), form("2", "email"));
    await hook.takeSnapshot();
    setForms(form("1", "fullName"), form("2", "email"));
    await hook.reportFieldChanges();
    act(() => root?.unmount());

    // The second one opens the same version with that rename in it and renames another field.
    render();
    setForms(form("1", "fullName"), form("2", "email"));
    await hook.takeSnapshot();
    setForms(form("1", "fullName"), form("2", "mail"));
    await hook.reportFieldChanges();

    const [first, second] = report.mock.calls.map(([, data]) => data);
    expect(first).toMatchObject({
      version: 3,
      renames: [{ oldKey: "name", newKey: "fullName" }],
    });
    expect(second).toMatchObject({
      version: 3,
      renames: [{ oldKey: "email", newKey: "mail" }],
    });
    // The server keeps the renames of each session, so the second report does not replace the first.
    expect(second.sessionId).not.toBe(first.sessionId);
  });

  it("Saved without renames: nothing is sent", async () => {
    render();
    setForms(form("1", "name"));
    await hook.takeSnapshot();

    await hook.reportFieldChanges();

    expect(report).not.toHaveBeenCalled();
  });

  it("Same renames on the next save: they are sent once", async () => {
    render();
    setForms(form("1", "name"));
    await hook.takeSnapshot();

    setForms(form("1", "fullName"));
    await hook.reportFieldChanges();
    await hook.reportFieldChanges();

    expect(report).toHaveBeenCalledTimes(1);
  });

  it("Rename undone: an empty report replaces the earlier one", async () => {
    render();
    setForms(form("1", "name"));
    await hook.takeSnapshot();

    setForms(form("1", "fullName"));
    await hook.reportFieldChanges();
    setForms(form("1", "name"));
    await hook.reportFieldChanges();

    expect(report).toHaveBeenCalledTimes(2);
    expect(report.mock.calls[1][1].renames).toEqual([]);
    expect(report.mock.calls[1][1].sequence).toBeGreaterThan(
      report.mock.calls[0][1].sequence,
    );
  });

  describe("a report still on its way", () => {
    // The server answers the next report only when the test lets it.
    const holdNextReport = () => {
      let answer: (fail?: unknown) => void = () => {};
      report.mockImplementationOnce(
        () =>
          new Promise<void>((resolve, reject) => {
            answer = (fail) => (fail ? reject(fail) : resolve());
          }),
      );

      return (fail?: unknown) => answer(fail);
    };

    // A report whose request has gone out and has no answer yet.
    const sendHeld = async () => {
      const answer = holdNextReport();
      const sent = hook.reportFieldChanges();
      await vi.waitFor(() => expect(report).toHaveBeenCalledTimes(1));

      return { answer, sent };
    };

    it("Rename undone before the server answered: the empty report still goes after it", async () => {
      render();
      setForms(form("1", "name"));
      await hook.takeSnapshot();

      setForms(form("1", "fullName"));
      const { answer, sent } = await sendHeld();
      setForms(form("1", "name"));
      await hook.reportFieldChanges();
      answer();
      await sent;

      expect(report).toHaveBeenCalledTimes(2);
      expect(report.mock.calls[1][1].renames).toEqual([]);
      // The server keeps the report with the highest number: the empty one.
      expect(report.mock.calls[1][1].sequence).toBeGreaterThan(
        report.mock.calls[0][1].sequence,
      );
    });

    it("Same renames read again before the server answered: they are sent once", async () => {
      render();
      setForms(form("1", "name"));
      await hook.takeSnapshot();

      setForms(form("1", "fullName"));
      const { answer, sent } = await sendHeld();
      await hook.reportFieldChanges();
      answer();
      await sent;

      expect(report).toHaveBeenCalledTimes(1);
    });

    it("Report that was on its way failed: the same renames are sent on the next read", async () => {
      render();
      setForms(form("1", "name"));
      await hook.takeSnapshot();

      setForms(form("1", "fullName"));
      const { answer, sent } = await sendHeld();
      answer(httpError(500));
      await sent;
      await hook.reportFieldChanges();

      expect(report).toHaveBeenCalledTimes(2);
      expect(report.mock.calls[1][1].renames).toEqual([
        { oldKey: "name", newKey: "fullName" },
      ]);
    });

    it("Earlier report answered after a later one went out: the later one is not sent again", async () => {
      render();
      setForms(form("1", "name"), form("2", "email"));
      await hook.takeSnapshot();

      setForms(form("1", "fullName"), form("2", "email"));
      const first = await sendHeld();
      setForms(form("1", "fullName"), form("2", "mail"));
      const second = holdNextReport();
      const sent = hook.reportFieldChanges();
      await vi.waitFor(() => expect(report).toHaveBeenCalledTimes(2));

      first.answer();
      await first.sent;
      await hook.reportFieldChanges();
      second();
      await sent;

      expect(report).toHaveBeenCalledTimes(2);
    });
  });

  it("A field the editor gives no id: the read tells nothing and nothing is sent", async () => {
    render();
    setForms(form("1", "name"), form("2", "email"));
    await hook.takeSnapshot();

    setForms(form(undefined, "fullName"), form(undefined, "email"));
    await hook.reportFieldChanges();

    expect(report).not.toHaveBeenCalled();
  });

  it("No id in the snapshot: later reads are not compared against it", async () => {
    render();
    setForms(form(undefined, "name"), form(undefined, "email"));
    await takeSnapshotWithRetries();

    setForms(form("1", "fullName"), form("2", "email"));
    await hook.reportFieldChanges();

    expect(report).not.toHaveBeenCalled();
  });

  it("One field without an id: the whole read tells nothing, not only that field", async () => {
    render();
    setForms(form(undefined, "name"), form("2", "email"));
    await takeSnapshotWithRetries();

    setForms(form(undefined, "fullName"), form("2", "mail"));
    await hook.reportFieldChanges();

    expect(report).not.toHaveBeenCalled();
  });

  it("A field the editor gives no key: the other fields are still tracked", async () => {
    render();
    setForms({ GetInternalId: () => "1" }, form("2", "email"));
    await hook.takeSnapshot();

    setForms({ GetInternalId: () => "1" }, form("2", "mail"));
    await hook.reportFieldChanges();

    expect(report.mock.calls[0][1].renames).toEqual([
      { oldKey: "email", newKey: "mail" },
    ]);
  });

  it("Key cleared or too long: that field is left out of the report", async () => {
    render();
    setForms(form("1", "name"), form("2", "email"), form("3", "phone"));
    await hook.takeSnapshot();

    setForms(
      form("1", ""),
      form("2", "x".repeat(256)),
      form("3", "mobile"),
    );
    await hook.reportFieldChanges();

    expect(report.mock.calls[0][1].renames).toEqual([
      { oldKey: "phone", newKey: "mobile" },
    ]);
  });

  it("Fields sharing a key: renamed together they are one rename, split apart they are none", async () => {
    render();
    setForms(form("1", "choice"), form("2", "choice"), form("3", "agree"));
    await hook.takeSnapshot();

    setForms(form("1", "option"), form("2", "option"), form("3", "agree"));
    await hook.reportFieldChanges();
    expect(report.mock.calls[0][1].renames).toEqual([
      { oldKey: "choice", newKey: "option" },
    ]);

    setForms(form("1", "option"), form("2", "choice"), form("3", "agree"));
    await hook.reportFieldChanges();
    expect(report.mock.calls[1][1].renames).toEqual([]);
  });

  it("Form refused by the server: nothing more is sent in the session", async () => {
    render();
    setForms(form("1", "name"));
    await hook.takeSnapshot();

    report.mockRejectedValueOnce(httpError(403));
    setForms(form("1", "fullName"));
    await hook.reportFieldChanges();
    setForms(form("1", "fullerName"));
    await hook.reportFieldChanges();

    expect(report).toHaveBeenCalledTimes(1);
  });

  it("Other failure: the report is sent again on the next save", async () => {
    render();
    setForms(form("1", "name"));
    await hook.takeSnapshot();

    report.mockRejectedValueOnce(httpError(429));
    setForms(form("1", "fullName"));
    await hook.reportFieldChanges();
    await hook.reportFieldChanges();

    expect(report).toHaveBeenCalledTimes(2);
  });

  it("Editor left with an unsent report: it goes with a request that outlives the page", async () => {
    render();
    setForms(form("1", "name"));
    await hook.takeSnapshot();

    report.mockRejectedValueOnce(httpError(500));
    setForms(form("1", "fullName"));
    await hook.reportFieldChanges();

    window.dispatchEvent(new Event("pagehide"));

    expect(report).toHaveBeenCalledTimes(2);
    expect(report).toHaveBeenLastCalledWith(
      7,
      {
        version: 3,
        sessionId: report.mock.calls[0][1].sessionId,
        sequence: report.mock.calls[0][1].sequence,
        renames: [{ oldKey: "name", newKey: "fullName" }],
      },
      true,
    );
  });

  it("Editor left after the report was sent: nothing more is sent", async () => {
    render();
    setForms(form("1", "name"));
    await hook.takeSnapshot();

    setForms(form("1", "fullName"));
    await hook.reportFieldChanges();
    window.dispatchEvent(new Event("pagehide"));

    expect(report).toHaveBeenCalledTimes(1);
  });

  it("Several reads: one connector serves the session and is closed with the editor", async () => {
    render();
    setForms(form("1", "name"));
    await hook.takeSnapshot();

    setForms(form("1", "fullName"));
    await hook.reportFieldChanges();
    setForms(form("1", "fullerName"));
    await hook.reportFieldChanges();

    expect(editor.createConnector).toHaveBeenCalledTimes(1);
    expect(editor.disconnect).not.toHaveBeenCalled();

    act(() => root?.unmount());
    root = null;

    expect(editor.disconnect).toHaveBeenCalledTimes(1);
  });

  it("Editor busy as the form opens: the snapshot is read again and the renames are reported", async () => {
    render();
    setForms(form("1", "name"));
    failNextRead();
    await takeSnapshotWithRetries();

    setForms(form("1", "fullName"));
    await hook.reportFieldChanges();

    expect(report.mock.calls[0][1].renames).toEqual([
      { oldKey: "name", newKey: "fullName" },
    ]);
  });

  it("Document changed before the snapshot was read again: nothing is reported and the session says so", async () => {
    render();
    setForms(form("1", "name"));
    failNextRead();

    vi.useFakeTimers();
    try {
      const done = hook.takeSnapshot();
      await vi.advanceTimersByTimeAsync(0);
      // The rename comes while the snapshot waits for its next try.
      setForms(form("1", "fullName"));
      hook.scheduleFieldChanges(true);
      await vi.runAllTimersAsync();
      await done;
    } finally {
      vi.useRealTimers();
    }
    await hook.reportFieldChanges();

    expect(report).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("not tracked"),
    );
  });

  it("Document changed while the snapshot was read: the session gives up at once, without waiting for another try", async () => {
    render();
    setForms(form("1", "name"));
    let answer: () => void = () => {};
    editor.callCommand.mockImplementationOnce(
      (command: () => unknown, callback: (result: unknown) => void) => {
        const result = command();
        answer = () => callback(result);
      },
    );

    vi.useFakeTimers();
    try {
      const done = hook.takeSnapshot();
      await vi.advanceTimersByTimeAsync(0);
      hook.scheduleFieldChanges(true);
      answer();
      await vi.advanceTimersByTimeAsync(0);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("not tracked"),
      );

      await vi.runAllTimersAsync();
      await done;
    } finally {
      vi.useRealTimers();
    }
  });

  it("Document only saved before the snapshot was read again: the snapshot is still taken", async () => {
    render();
    setForms(form("1", "name"));
    failNextRead();

    vi.useFakeTimers();
    try {
      const done = hook.takeSnapshot();
      await vi.advanceTimersByTimeAsync(0);
      hook.scheduleFieldChanges(false);
      await vi.runAllTimersAsync();
      await done;
    } finally {
      vi.useRealTimers();
    }
    setForms(form("1", "fullName"));
    await hook.reportFieldChanges();

    expect(report).toHaveBeenCalledTimes(1);
  });

  it("No connector from the editor: one try and nothing logged", async () => {
    editor.createConnector.mockImplementation(() => undefined);
    render();

    await hook.takeSnapshot();

    expect(editor.createConnector).toHaveBeenCalledTimes(1);
    expect(console.error).not.toHaveBeenCalled();
  });

  it("Report sent as the editor is left failed while the editor stays open: it is sent again", async () => {
    render();
    setForms(form("1", "name"));
    await hook.takeSnapshot();

    report.mockRejectedValueOnce(httpError(500));
    setForms(form("1", "fullName"));
    await hook.reportFieldChanges();

    report.mockRejectedValueOnce(httpError(500));
    hook.flushFieldChanges();
    await vi.waitFor(() => expect(console.error).toHaveBeenCalledTimes(2));
    hook.flushFieldChanges();

    expect(report).toHaveBeenCalledTimes(3);
  });

  it("Report sent as the editor is left taken by the server: it is not sent again", async () => {
    render();
    setForms(form("1", "name"));
    await hook.takeSnapshot();

    report.mockRejectedValueOnce(httpError(500));
    setForms(form("1", "fullName"));
    await hook.reportFieldChanges();

    hook.flushFieldChanges();
    await vi.waitFor(() => expect(report).toHaveBeenCalledTimes(2));
    await Promise.resolve();
    hook.flushFieldChanges();
    await hook.reportFieldChanges();

    expect(report).toHaveBeenCalledTimes(2);
  });

  it("Report sent as the editor is left still on its way: it is not sent twice", async () => {
    render();
    setForms(form("1", "name"));
    await hook.takeSnapshot();

    report.mockRejectedValueOnce(httpError(500));
    setForms(form("1", "fullName"));
    await hook.reportFieldChanges();

    // Closing from the editor and the page going away that follows it.
    report.mockImplementationOnce(() => new Promise(() => {}));
    hook.flushFieldChanges();
    window.dispatchEvent(new Event("pagehide"));

    expect(report).toHaveBeenCalledTimes(2);
  });

  it("Report sent as the editor is left refused: nothing more is sent in the session", async () => {
    render();
    setForms(form("1", "name"));
    await hook.takeSnapshot();

    report.mockRejectedValueOnce(httpError(500));
    setForms(form("1", "fullName"));
    await hook.reportFieldChanges();

    report.mockRejectedValueOnce(httpError(403));
    hook.flushFieldChanges();
    await vi.waitFor(() => expect(console.error).toHaveBeenCalledTimes(2));

    setForms(form("1", "fullerName"));
    await hook.reportFieldChanges();

    expect(report).toHaveBeenCalledTimes(2);
  });

  describe("reads as the document changes", () => {
    // The editor answers a read only when the test lets it: the fields are taken as the read starts.
    const answers: (() => void)[] = [];
    const holdReads = () =>
      editor.callCommand.mockImplementation(
        (command: () => unknown, callback: (result: unknown) => void) => {
          const result = command();
          answers.push(() => callback(result));
        },
      );
    // Lets a queued read start, or an answered one finish.
    const flush = () =>
      act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    const answerRead = async () => {
      await flush();
      answers.shift()?.();
      await flush();
    };

    const opened = async (...forms: TForm[]) => {
      render();
      setForms(...forms);
      await hook.takeSnapshot();
      holdReads();
      editor.callCommand.mockClear();
    };

    afterEach(() => {
      answers.length = 0;
    });

    it("Change: the fields are read at once, not after an interval", async () => {
      await opened(form("1", "name"));

      setForms(form("1", "fullName"));
      hook.scheduleFieldChanges(true);
      await flush();

      expect(editor.callCommand).toHaveBeenCalledTimes(1);
      await answerRead();
      expect(report.mock.calls[0][1].renames).toEqual([
        { oldKey: "name", newKey: "fullName" },
      ]);
    });

    it("Changes while a read is on its way: one more read serves them all and finds the last state", async () => {
      await opened(form("1", "name"));

      hook.scheduleFieldChanges(true);
      // The first read is on its way.
      await flush();
      setForms(form("1", "n1"));
      hook.scheduleFieldChanges(true);
      setForms(form("1", "n2"));
      hook.scheduleFieldChanges(false);
      setForms(form("1", "n3"));
      hook.scheduleFieldChanges(true);

      await answerRead();
      await answerRead();
      await answerRead();

      expect(editor.callCommand).toHaveBeenCalledTimes(2);
      expect(report.mock.calls.at(-1)?.[1].renames).toEqual([
        { oldKey: "name", newKey: "n3" },
      ]);
    });

    it("Change after the read began: it is read again, not lost", async () => {
      await opened(form("1", "name"), form("2", "email"));

      setForms(form("1", "fullName"), form("2", "email"));
      hook.scheduleFieldChanges(true);
      await answerRead();

      setForms(form("1", "fullName"), form("2", "mail"));
      hook.scheduleFieldChanges(true);
      await answerRead();

      expect(report.mock.calls.at(-1)?.[1].renames).toEqual([
        { oldKey: "email", newKey: "mail" },
        { oldKey: "name", newKey: "fullName" },
      ]);
    });

    it("Report still on its way: the next change is read, and leaving the editor sends it", async () => {
      await opened(form("1", "name"), form("2", "email"));

      // The server has not answered either report as the page goes away, which cancels a plain request.
      report
        .mockImplementationOnce(() => new Promise(() => {}))
        .mockImplementationOnce(() => new Promise(() => {}));
      setForms(form("1", "fullName"), form("2", "email"));
      hook.scheduleFieldChanges(true);
      await answerRead();

      setForms(form("1", "fullName"), form("2", "mail"));
      hook.scheduleFieldChanges(true);
      await answerRead();
      window.dispatchEvent(new Event("pagehide"));

      expect(editor.callCommand).toHaveBeenCalledTimes(2);
      const renames = [
        { oldKey: "email", newKey: "mail" },
        { oldKey: "name", newKey: "fullName" },
      ];
      expect(report).toHaveBeenLastCalledWith(
        7,
        expect.objectContaining({ renames }),
        true,
      );
    });

    it("Editor closed while a change is read: the rename goes once the read answers", async () => {
      await opened(form("1", "name"));

      // The plain report is cancelled as the editor is left.
      report.mockImplementationOnce(() => new Promise(() => {}));
      setForms(form("1", "fullName"));
      hook.scheduleFieldChanges(true);
      await flush();

      const closed = hook.closeFieldChanges();
      await answerRead();
      await closed;

      expect(report).toHaveBeenLastCalledWith(
        7,
        expect.objectContaining({
          renames: [{ oldKey: "name", newKey: "fullName" }],
        }),
        true,
      );
    });

    it("Editor closed while the editor does not answer the read: closing waits no longer than a second", async () => {
      await opened(form("1", "name"));

      setForms(form("1", "fullName"));
      hook.scheduleFieldChanges(true);
      await flush();

      vi.useFakeTimers();
      try {
        const closed = hook.closeFieldChanges();
        await vi.advanceTimersByTimeAsync(1000);
        await closed;
      } finally {
        vi.useRealTimers();
      }

      expect(report).not.toHaveBeenCalled();
    });
  });
});
