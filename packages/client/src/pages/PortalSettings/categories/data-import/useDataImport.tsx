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

import { useCallback } from "react";

import { toastr } from "@docspace/ui-kit/components/toast";

import ImportAccountsStore from "SRC_DIR/store/ImportAccountsStore";

export type UseDataImportProps = {
  isMigrationInit?: ImportAccountsStore["isMigrationInit"];
  getMigrationStatus?: ImportAccountsStore["getMigrationStatus"];
  setUsers?: ImportAccountsStore["setUsers"];
  setWorkspace?: ImportAccountsStore["setWorkspace"];
  setMigratingWorkspace?: ImportAccountsStore["setMigratingWorkspace"];
  setFiles?: ImportAccountsStore["setFiles"];
  setLoadingStatus?: ImportAccountsStore["setLoadingStatus"];
  setMigrationPhase?: ImportAccountsStore["setMigrationPhase"];
  setServices?: ImportAccountsStore["setServices"];
  getMigrationList?: ImportAccountsStore["getMigrationList"];
};

const useDataImport = ({
  isMigrationInit,
  getMigrationStatus,
  setUsers,
  setWorkspace,
  setMigratingWorkspace,
  setFiles,
  setLoadingStatus,
  setMigrationPhase,
  setServices,
  getMigrationList,
}: UseDataImportProps) => {
  const updateStatus = useCallback(async () => {
    try {
      if (isMigrationInit) return;

      const response = await getMigrationStatus?.();

      if (!response) return;

      const { parseResult, error, isCompleted } = response;

      const isErrorOrFailedParse =
        error || parseResult?.failedArchives.length > 0;
      const isNoUsersParsed =
        (parseResult?.users.length ?? 0) +
          (parseResult?.existUsers.length ?? 0) +
          (parseResult?.withoutEmailUsers.length ?? 0) ===
        0;

      if (isErrorOrFailedParse || isNoUsersParsed) return;

      if (parseResult?.operation === "parse") {
        setWorkspace?.(parseResult.migratorName);
        setMigratingWorkspace?.(parseResult.migratorName);
        setFiles?.(parseResult.files);

        if (isCompleted) {
          setUsers?.(parseResult);
          setMigrationPhase?.("setup");
          setLoadingStatus?.("done");
        } else {
          setLoadingStatus?.("proceed");
        }
      }

      if (parseResult?.operation === "migration") {
        setWorkspace?.(parseResult.migratorName);
        setMigratingWorkspace?.(parseResult.migratorName);

        if (isCompleted) {
          setMigrationPhase?.("complete");
        } else {
          setMigrationPhase?.("migrating");
        }
      }
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "CanceledError" || error.message === "canceled")
      ) {
        return;
      }

      toastr.error(error as string);
    }
  }, [
    isMigrationInit,
    getMigrationStatus,
    setUsers,
    setWorkspace,
    setMigratingWorkspace,
    setFiles,
    setLoadingStatus,
    setMigrationPhase,
  ]);

  const handleMigrationCheck = useCallback(async () => {
    const migrationList = await getMigrationList?.();

    setServices?.(migrationList ?? []);
  }, [getMigrationList, setServices]);

  const getDataImportInitialValue = useCallback(async () => {
    if (window.location.pathname.includes("data-import")) {
      await Promise.all([handleMigrationCheck(), updateStatus()]);
    }
  }, [handleMigrationCheck, updateStatus]);

  return {
    updateStatus,
    handleMigrationCheck,
    getDataImportInitialValue,
  };
};

export default useDataImport;
