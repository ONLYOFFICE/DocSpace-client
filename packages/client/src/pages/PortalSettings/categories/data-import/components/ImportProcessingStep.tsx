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

import { useState, useEffect, useRef } from "react";
import { inject, observer } from "mobx-react";

import { ProgressBar } from "@docspace/shared/components/progress-bar";

import { toastr } from "@docspace/shared/components/toast";
import { Wrapper } from "../StyledDataImport";
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
    <Wrapper>
      <ProgressBar
        percent={percent}
        isInfiniteProgress={isVisibleProgress}
        className="data-import-progress-bar"
      />
    </Wrapper>
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
