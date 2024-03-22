// (c) Copyright Ascensio System SIA 2009-2024
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
import { isTablet } from "@docspace/shared/utils/device";
import { CancelUploadDialog } from "SRC_DIR/components/dialogs";
import styled from "styled-components";

import { ProgressBar } from "@docspace/shared/components/progress-bar";
import { Button } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";

const Wrapper = styled.div`
  max-width: 350px;

  .data-import-progress-bar {
    margin-top: -8px;
    margin-bottom: 16px;
  }
`;

const ImportProcessingStep = ({
  t,
  onNextStep,
  isFifthStep,
  setIsLoading,
  proceedFileMigration,
  cancelMigration,
  getMigrationStatus,
}) => {
  const [percent, setPercent] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const uploadInterval = useRef(null);

  const handleFileMigration = async () => {
    setIsLoading(true);
    setPercent(0);
    setIsVisible(true);
    try {
      await proceedFileMigration("GoogleWorkspace");

      uploadInterval.current = setInterval(async () => {
        const res = await getMigrationStatus();
        setPercent(res.progress);

        if (res.progress > 10) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }

        if (res.isCompleted || res.progress === 100) {
          clearInterval(uploadInterval.current);
          setIsLoading(false);
          setIsVisible(false);
          setPercent(100);
          setTimeout(() => {
            onNextStep();
          }, 1000);
        }
      }, 1000);
    } catch (error) {
      console.log(error);
      toastr.error(error);
      setIsLoading(false);
    }
  };

  // const hideCancelDialog = () => setIsVisible(false);

  // const onCancel = () => {
  //   setIsVisible(true);
  // };

  // const handleCancelMigration = () => {
  //   setIsLoading(false);
  //   cancelMigration();
  // }

  useEffect(() => {
    handleFileMigration();

    return () => clearInterval(uploadInterval.current);
  }, []);

  return (
    <Wrapper>
      <ProgressBar
        percent={percent}
        isInfiniteProgress={isVisible}
        className="data-import-progress-bar"
      />
      {/* <Button
        size={isTablet() ? "medium" : "small"}
        label={t("Common:CancelButton")}
        onClick={onCancel}
      />

      {isVisible && (
        <CancelUploadDialog
          visible={isVisible}
          loading={false}
          isFifthStep={isFifthStep}
          cancelMigration={handleCancelMigration}
          onClose={hideCancelDialog}
        />
      )} */}
    </Wrapper>
  );
};

export default inject(({ importAccountsStore }) => {
  const {
    setIsLoading,
    proceedFileMigration,
    cancelMigration,
    getMigrationStatus,
  } = importAccountsStore;

  return {
    setIsLoading,
    proceedFileMigration,
    cancelMigration,
    getMigrationStatus,
  };
})(observer(ImportProcessingStep));
