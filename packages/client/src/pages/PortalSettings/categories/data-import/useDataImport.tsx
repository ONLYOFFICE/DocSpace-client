// (c) Copyright Ascensio System SIA 2009-2025
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

import { useCallback } from "react";

import { toastr } from "@docspace/shared/components/toast";

import ImportAccountsStore from "SRC_DIR/store/ImportAccountsStore";

export type UseDataImportProps = {
  isMigrationInit: ImportAccountsStore["isMigrationInit"];
  getMigrationStatus: ImportAccountsStore["getMigrationStatus"];
  setUsers: ImportAccountsStore["setUsers"];
  setWorkspace: ImportAccountsStore["setWorkspace"];
  setMigratingWorkspace: ImportAccountsStore["setMigratingWorkspace"];
  setFiles: ImportAccountsStore["setFiles"];
  setLoadingStatus: ImportAccountsStore["setLoadingStatus"];
  setMigrationPhase: ImportAccountsStore["setMigrationPhase"];
  setServices: ImportAccountsStore["setServices"];
  getMigrationList: ImportAccountsStore["getMigrationList"];
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

      const response = await getMigrationStatus();

      if (!response) return;

      const { parseResult, error, isCompleted } = response;

      const isErrorOrFailedParse =
        error || parseResult.failedArchives.length > 0;
      const isNoUsersParsed =
        parseResult.users.length +
          parseResult.existUsers.length +
          parseResult.withoutEmailUsers.length ===
        0;

      if (isErrorOrFailedParse || isNoUsersParsed) return;

      if (parseResult.operation === "parse") {
        setWorkspace(parseResult.migratorName);
        setMigratingWorkspace(parseResult.migratorName);
        setFiles(parseResult.files);

        if (isCompleted) {
          setUsers(parseResult);
          setMigrationPhase("setup");
          setLoadingStatus("done");
        } else {
          setLoadingStatus("proceed");
        }
      }

      if (parseResult.operation === "migration") {
        setWorkspace(parseResult.migratorName);
        setMigratingWorkspace(parseResult.migratorName);

        if (isCompleted) {
          setMigrationPhase("complete");
        } else {
          setMigrationPhase("migrating");
        }
      }
    } catch (error) {
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
    const migrationList = await getMigrationList();
    // setAreProvidersReady(true);
    setServices(migrationList);
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
