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

import { useState, useEffect, useRef } from "react";
import { inject, observer } from "mobx-react";

import { ProgressBar } from "@docspace/ui-kit/components/progress-bar";

import { toastr } from "@docspace/ui-kit/components/toast";
import styles from "../StyledDataImport.module.scss";
import {
  ImportProcessingStepProps,
  InjectedImportProcessingStepProps,
} from "../types";

const FAIL_TRIES = 2;

const ImportProcessingStep = (props: ImportProcessingStepProps) => {
  const {
    t,
    migratorName,
    incrementStep,
    setIsLoading,
    proceedFileMigration,
    getMigrationStatus,
  } = props as InjectedImportProcessingStepProps;

  const [percent, setPercent] = useState(0);
  const [isVisibleProgress, setIsVisibleProgress] = useState(false);
  const [failTries, setFailTries] = useState(FAIL_TRIES);

  const uploadInterval = useRef<number>(undefined);

  const handleFileMigration = async () => {
    setIsLoading(true);
    setPercent(0);
    setIsVisibleProgress(true);
    try {
      await proceedFileMigration(migratorName);

      uploadInterval.current = window.setInterval(async () => {
        const res = await getMigrationStatus();

        if (!res && failTries) {
          setFailTries((prevTries) => prevTries - 1);
          return;
        }

        if (!res) {
          toastr.error(t("Common:SomethingWentWrong"));
          clearInterval(uploadInterval.current);
          return;
        }

        setPercent(res.progress);
        setIsVisibleProgress(res.progress <= 10);

        if (res.isCompleted || res.progress === 100) {
          clearInterval(uploadInterval.current);
          setIsLoading(false);
          setIsVisibleProgress(false);
          setPercent(100);
          setTimeout(() => {
            incrementStep();
          }, 1000);
        }
      }, 1000);
    } catch (error) {
      toastr.error(error || t("Common:SomethingWentWrong"));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleFileMigration();

    return () => clearInterval(uploadInterval.current);
  }, []);

  return (
    <div className={styles.wrapper}>
      <ProgressBar
        percent={percent}
        isInfiniteProgress={isVisibleProgress}
        className="data-import-progress-bar"
      />
    </div>
  );
};

export default inject<TStore>(({ importAccountsStore }) => {
  const {
    incrementStep,
    setIsLoading,
    proceedFileMigration,
    getMigrationStatus,
  } = importAccountsStore;

  return {
    incrementStep,
    setIsLoading,
    proceedFileMigration,
    getMigrationStatus,
  };
})(observer(ImportProcessingStep));
