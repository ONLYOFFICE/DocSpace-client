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

import { useCallback, useEffect, useRef } from "react";

import { reportFormFieldChanges } from "@docspace/shared/api/files";
import type { TFormFieldKeyChange } from "@docspace/shared/api/files/types";

import type { TEditorConnector } from "@/types";
import { getDocEditor } from "@/utils";

type TBuilderForm = {
  GetInternalId?: () => unknown;
  GetFormKey?: () => unknown;
};

// The document builder API the editor provides to a connector command, which runs inside the editor.
declare const Api: {
  GetDocument: () => { GetAllForms?: () => TBuilderForm[] };
};

// A snapshot read the editor did not answer is tried again after this long.
const SNAPSHOT_RETRY_DELAY = 3000;

// A read the editor does not answer, as while it is busy, gives up: nothing waits on it for long.
const READ_TIMEOUT = 5000;

// How many times the fields of the form as it was opened are read before the session gives up tracking them.
const SNAPSHOT_ATTEMPTS = 3;

// The longest key the server accepts.
const MAX_KEY_LENGTH = 255;

type TEditorField = { id: string; key: string };

// Every field has an id of its own and a key; a read that cannot tell a field apart tells nothing.
const isEditorFields = (value: unknown): value is TEditorField[] => {
  if (!Array.isArray(value)) return false;

  const ids = new Set<string>();
  const valid = value.every((field: unknown) => {
    if (typeof field !== "object" || field === null) return false;
    if (!("id" in field) || !("key" in field)) return false;
    if (typeof field.id !== "string" || !field.id) return false;
    if (typeof field.key !== "string") return false;

    ids.add(field.id);
    return true;
  });

  return valid && ids.size === value.length;
};

const getErrorStatus = (error: unknown) => {
  if (typeof error !== "object" || error === null) return undefined;
  if (!("response" in error)) return undefined;

  const { response } = error;
  if (typeof response !== "object" || response === null) return undefined;
  if (!("status" in response)) return undefined;

  return typeof response.status === "number" ? response.status : undefined;
};

const isReportableKey = (key: string) =>
  key.length > 0 && key.length <= MAX_KEY_LENGTH;

// The fields of the document open in the editor, saved or not; null when the editor cannot tell them. The command only
// reads, so the document is not recalculated after it. It runs inside the editor from its source text, so it uses
// nothing from outside and no syntax a build could turn into a helper.
const readEditorFields = (
  connector: TEditorConnector | null,
): Promise<TEditorField[] | null> =>
  new Promise((resolve) => {
    if (!connector?.callCommand) {
      resolve(null);
      return;
    }

    const timer = setTimeout(() => resolve(null), READ_TIMEOUT);

    connector.callCommand(
      () => {
        const doc = Api.GetDocument();
        if (!doc.GetAllForms) return "null";

        return JSON.stringify(
          doc.GetAllForms().map((f) => ({
            id: f.GetInternalId ? String(f.GetInternalId()) : "",
            key: f.GetFormKey ? f.GetFormKey() : null,
          })),
        );
      },
      (result) => {
        clearTimeout(timer);

        try {
          const fields: unknown =
            typeof result === "string" ? JSON.parse(result) : null;
          resolve(isEditorFields(fields) ? fields : null);
        } catch {
          resolve(null);
        }
      },
      true,
    );
  });

// A key renamed when every field that had it and is still there has one new key; the key of fields that went separate
// ways is not renamed, since the earlier answers would then follow one of them only.
const getRenames = (
  before: Map<string, string>,
  fields: TEditorField[],
): TFormFieldKeyChange[] => {
  const targets = new Map<string, Set<string>>();

  fields.forEach(({ id, key }) => {
    const oldKey = before.get(id);
    if (oldKey === undefined) return;

    const keys = targets.get(oldKey) ?? new Set<string>();
    keys.add(key);
    targets.set(oldKey, keys);
  });

  const renames: TFormFieldKeyChange[] = [];

  targets.forEach((keys, oldKey) => {
    if (keys.size !== 1) return;

    const [newKey] = keys;
    if (newKey === oldKey) return;
    if (!isReportableKey(oldKey) || !isReportableKey(newKey)) return;

    renames.push({ oldKey, newKey });
  });

  return renames.sort((a, b) => a.oldKey.localeCompare(b.oldKey));
};

// No renames is what the server assumes for a session that has not reported.
const NO_RENAMES = JSON.stringify([]);

// Tells the server which fields the user renamed in this editor session: a field keeps its id in the session when its key
// changes, so the version the session is saved as keeps the earlier responses of these fields under their new names.
// Reported as the document changes, before the filling starts and when the editor is left, since the user may close
// it and start the filling later from the room. Only for the original form of a form-filling room opened for editing;
// it never holds the editor back.
const useFormFieldChanges = (
  fileId?: number | string,
  version?: number,
  enabled?: boolean,
) => {
  // The editor keeps the event handlers of its first render, so the callbacks below never change and read the form
  // from here.
  const form = useRef({ fileId, version, enabled });
  form.current = { fileId, version, enabled };
  // One connector for the session, made on the first read and closed with the editor.
  const connector = useRef<TEditorConnector | null>(null);
  const snapshot = useRef<Map<string, string> | null>(null);
  // The document was changed since it was opened: a snapshot taken now could hold renames already.
  const changed = useRef(false);
  const disposed = useRef(false);
  // The renames read last and the number of that read; the server keeps the report with the highest number.
  const latest = useRef<{
    renames: TFormFieldKeyChange[];
    sequence: number;
  } | null>(null);
  // The renames the server took last, with the number of their report.
  const reported = useRef({ report: NO_RENAMES, sequence: 0 });
  // The renames sent as the editor is left, while their request is on its way.
  const flushing = useRef<string | null>(null);
  // Reads go one after another, each numbered above the one before; the server keeps the report with the highest
  // number, so a report sent late cannot replace a newer one.
  const queue = useRef<Promise<void>>(Promise.resolve());
  // A read is queued and has not started: a change coming now is in what it reads.
  const readQueued = useRef(false);
  // The server refused the form, as when it is not the original form of a form-filling room: nothing more is sent in
  // this session.
  const refused = useRef(false);

  // The form the reports are about; null while nothing is to be reported.
  const target = useCallback(() => {
    const { fileId: id, version: openedVersion, enabled: on } = form.current;
    if (!on || !id || !openedVersion || refused.current) return null;

    return { id, openedVersion };
  }, []);

  const markReported = useCallback((report: string, sequence: number) => {
    if (sequence >= reported.current.sequence) {
      reported.current = { report, sequence };
    }
  }, []);

  const onReportError = useCallback((error: unknown) => {
    const status = getErrorStatus(error);
    if (status === 403 || status === 404) refused.current = true;

    console.error("Form field changes were not reported:", error);
  }, []);

  const readFields = useCallback(() => {
    connector.current ??= getDocEditor()?.createConnector?.() ?? null;
    return readEditorFields(connector.current);
  }, []);

  // The fields as the form was opened. A read the editor does not answer, as while it is still busy opening the form,
  // is tried again while the document is unchanged; without a snapshot nothing is reported in the session.
  const takeSnapshot = useCallback(async () => {
    for (let attempt = 1; attempt <= SNAPSHOT_ATTEMPTS; attempt += 1) {
      if (!form.current.enabled || disposed.current || changed.current) break;

      const fields = await readFields();

      // A change made while the fields were read may be in them already.
      if (fields && !changed.current) {
        snapshot.current = new Map(fields.map((f) => [f.id, f.key]));
        return;
      }

      // No connector, as in Community Edition: there is nothing to track.
      if (!connector.current?.callCommand) return;

      if (attempt < SNAPSHOT_ATTEMPTS) {
        await new Promise((resolve) =>
          setTimeout(resolve, SNAPSHOT_RETRY_DELAY),
        );
      }
    }

    if (form.current.enabled && !disposed.current) {
      console.error(
        "Form field changes are not tracked: the editor did not tell the fields of the form",
      );
    }
  }, [readFields]);

  // Reads the fields and sends the renames when they changed since the last report. The next read does not wait for
  // the request, so the renames read last are known as the editor is left even while a report is on its way.
  const reportFieldChanges = useCallback(() => {
    const read = queue.current.then(async () => {
      readQueued.current = false;

      const before = snapshot.current;
      const to = target();
      if (!to || !before) return null;

      const sequence = Math.max(
        Date.now(),
        (latest.current?.sequence ?? 0) + 1,
      );
      const fields = await readFields();
      if (!fields) return null;

      const renames = getRenames(before, fields);
      latest.current = { renames, sequence };

      return { to, renames, sequence, report: JSON.stringify(renames) };
    });
    queue.current = read.then(
      () => undefined,
      () => undefined,
    );

    return read.then(async (result) => {
      // Nothing new since the last report.
      if (!result || result.report === reported.current.report) return;

      const { to, renames, sequence, report } = result;
      try {
        await reportFormFieldChanges(to.id, {
          version: to.openedVersion,
          sequence,
          renames,
        });
        markReported(report, sequence);
      } catch (error) {
        onReportError(error);
      }
    });
  }, [target, readFields, markReported, onReportError]);

  // On a change of the document and on its save: a key changed in the field properties shows as a change at once,
  // while the save may come only when the field or the editor is left. The fields are read at once, and changes that
  // come while a read is on its way share one more read, so they are not read once each.
  const scheduleFieldChanges = useCallback(
    (modified: boolean) => {
      if (!form.current.enabled) return;

      if (modified) changed.current = true;
      if (readQueued.current) return;

      readQueued.current = true;
      reportFieldChanges();
    },
    [reportFieldChanges],
  );

  // The editor is being left: the renames read last go with a request that outlives the page. They count as reported
  // once the server took them, since the editor may stay open, as in a frame that only reports its closing.
  const flushFieldChanges = useCallback(() => {
    const last = latest.current;
    const to = target();
    if (!to || !last) return;

    const report = JSON.stringify(last.renames);
    if (report === reported.current.report || report === flushing.current) {
      return;
    }

    flushing.current = report;
    reportFormFieldChanges(
      to.id,
      {
        version: to.openedVersion,
        sequence: last.sequence,
        renames: last.renames,
      },
      true,
    )
      .then(() => markReported(report, last.sequence))
      .catch(onReportError)
      .finally(() => {
        if (flushing.current === report) flushing.current = null;
      });
  }, [target, markReported, onReportError]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("pagehide", flushFieldChanges);

    return () => window.removeEventListener("pagehide", flushFieldChanges);
  }, [enabled, flushFieldChanges]);

  useEffect(() => {
    disposed.current = false;

    return () => {
      disposed.current = true;
      connector.current?.disconnect?.();
      connector.current = null;
    };
  }, []);

  return {
    takeSnapshot,
    reportFieldChanges,
    scheduleFieldChanges,
    flushFieldChanges,
  };
};

export default useFormFieldChanges;

