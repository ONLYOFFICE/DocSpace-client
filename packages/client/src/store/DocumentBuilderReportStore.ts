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

import { makeAutoObservable, runInAction } from "mobx";

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { toastr, type TData } from "@docspace/ui-kit/components/toast";
import { pollUntil } from "@docspace/ui-kit/billing/utils/stripe-flow";
import type { TDocumentBuilderTask } from "@docspace/shared/api/files/types";
import type { Nullable } from "@docspace/shared/types";

import i18n from "../i18n";

import type FilesSettingsStore from "./FilesSettingsStore";

export const ReportType = {
  RoomHistory: "roomHistory",
  LoginHistory: "loginHistory",
  AuditTrail: "auditTrail",
} as const;

export type TReportType = (typeof ReportType)[keyof typeof ReportType];

// Every report is built by the same server-side document builder: a POST
// starts the task, a GET returns its progress, and the result is saved to
// "My documents" — so a report only has to say which endpoints to call.
export type TReportRequests = {
  start: () => Promise<Nullable<TDocumentBuilderTask>>;
  getStatus: () => Promise<Nullable<TDocumentBuilderTask>>;
};

// How long the client keeps watching a task before it stops polling. The
// builder is not cancelled — it keeps running on the server and still saves the
// file, so giving up only means the user has to pick the file up themselves.
export const REPORT_BUILD_TIMEOUT_MS = 10 * 60 * 1000;

const getSaveLocationText = () =>
  i18n.t("Common:ReportSaveLocation", { sectionName: i18n.t("Common:Files") });

class DocumentBuilderReportStore {
  private filesSettingsStore: FilesSettingsStore;

  private buildingReports = new Set<TReportType>();

  // Reports whose page was left while the server was still building them:
  // the file is announced with a toast but no longer opened, so the user is
  // not pulled out of wherever they navigated to.
  private abandonedReports = new Set<TReportType>();

  constructor(filesSettingsStore: FilesSettingsStore) {
    this.filesSettingsStore = filesSettingsStore;

    makeAutoObservable(this);
  }

  isReportBuilding = (type: TReportType) => this.buildingReports.has(type);

  markReportPageLeft = (type: TReportType) => {
    if (this.isReportBuilding(type)) this.abandonedReports.add(type);
  };

  resetReportPageLeft = (type: TReportType) => {
    this.abandonedReports.delete(type);
  };

  buildReport = async (type: TReportType, requests: TReportRequests) => {
    if (this.isReportBuilding(type)) return;

    this.resetReportPageLeft(type);
    this.buildingReports.add(type);

    // The timeout is driven by the abort signal rather than by pollUntil's own
    // one, because pollUntil rejects with an untranslatable Error while giving
    // up on a still-running builder is not something to report as a failure.
    const abortController = new AbortController();
    const timeoutId = window.setTimeout(
      () => abortController.abort(),
      REPORT_BUILD_TIMEOUT_MS,
    );

    try {
      let task = await requests.start();

      if (!task?.isCompleted && !task?.error) {
        await pollUntil(
          async () => {
            task = await requests.getStatus();

            return !!task?.isCompleted || !!task?.error;
          },
          abortController.signal,
          { timeoutMs: Number.POSITIVE_INFINITY },
        );
      }

      if (task?.error) {
        toastr.error(task.error);
        return;
      }

      if (!task?.isCompleted) {
        toastr.info(getSaveLocationText());
        return;
      }

      this.finishReport(type, task.resultFileUrl);
    } catch (error) {
      toastr.error(error as TData);
    } finally {
      window.clearTimeout(timeoutId);

      runInAction(() => {
        this.buildingReports.delete(type);
        this.abandonedReports.delete(type);
      });
    }
  };

  private finishReport = (type: TReportType, resultFileUrl?: string) => {
    if (!resultFileUrl) {
      toastr.error(i18n.t("Common:SomethingWentWrong"));
      return;
    }

    toastr.success(getSaveLocationText());

    // The toast is all the user gets once they have left the page the report
    // was started from — opening the file would pull them out of wherever they
    // navigated to.
    if (this.abandonedReports.has(type)) return;

    const { openOnNewPage } = this.filesSettingsStore;
    const url = combineUrl(window.ClientConfig?.proxy?.url, resultFileUrl);

    // hack for ios
    setTimeout(() => window.open(url, openOnNewPage ? "_blank" : "_self"), 100);
  };
}

export default DocumentBuilderReportStore;
