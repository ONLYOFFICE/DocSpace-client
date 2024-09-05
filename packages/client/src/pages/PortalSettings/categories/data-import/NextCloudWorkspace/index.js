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

import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { isMobile as isMobileBreakpoint } from "@docspace/shared/utils/device";
import { isMobile } from "react-device-detect";
import { useNavigate } from "react-router-dom";
import useViewEffect from "SRC_DIR/Hooks/useViewEffect";
import styled from "styled-components";

import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";
import { getStepsData } from "./Stepper";
import BreakpointWarning from "SRC_DIR/components/BreakpointWarning";
import SelectFileLoader from "../sub-components/SelectFileLoader";

const NextcloudWrapper = styled.div`
  max-width: 700px;

  .data-import-counter {
    margin-top: 19px;
    margin-bottom: 9px;
  }

  .data-import-section-description {
    margin-bottom: 8px;
    font-size: 12px;
  }
`;

const NextcloudWorkspace = (props) => {
  const {
    t,
    tReady,
    theme,
    clearCheckedAccounts,
    viewAs,
    setViewAs,
    currentDeviceType,
    getMigrationStatus,
    setUsers,
    filteredUsers,
  } = props;
  const [currentStep, setCurrentStep] = useState(1);
  const [shouldRender, setShouldRender] = useState(false);
  const StepsData = getStepsData(
    t,
    currentStep,
    setCurrentStep,
    filteredUsers.length === 0,
    t("Common:OrganizationName"),
  );
  const navigate = useNavigate();

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  useEffect(() => {
    try {
      getMigrationStatus().then((res) => {
        if (
          !res ||
          res.parseResult.users.length +
            res.parseResult.existUsers.length +
            res.parseResult.withoutEmailUsers.length ===
            0
        ) {
          setShouldRender(true);
          return;
        }

        if (res.parseResult.migratorName !== "Nextcloud") {
          const workspacesEnum = {
            GoogleWorkspace: "google",
            Nextcloud: "nextcloud",
            Workspace: "onlyoffice",
          };
          const migratorName = res.parseResult.migratorName;

          setShouldRender(true);
          navigate(
            `/portal-settings/data-import/migration/${workspacesEnum[migratorName]}?service=${migratorName}`,
          );
        }

        if (res.parseResult.operation === "parse" && res.isCompleted) {
          setUsers(res.parseResult);
          setCurrentStep(2);
        }

        if (res.parseResult.operation === "migration" && !res.isCompleted) {
          setCurrentStep(6);
        }

        if (res.parseResult.operation === "migration" && res.isCompleted) {
          setCurrentStep(7);
        }

        setShouldRender(true);
      });
    } catch (error) {
      toastr.error(error);
    }

    return clearCheckedAccounts;
  }, []);

  if (isMobileBreakpoint())
    return (
      <BreakpointWarning
        isMobileUnavailableOnly
        sectionName={t("Settings:DataImport")}
      />
    );

  if (!tReady || !shouldRender) return <SelectFileLoader />;

  return (
    <>
      <NextcloudWrapper>
        <Text
          className="data-import-description"
          lineHeight="20px"
          color={theme.isBase ? "#657077" : "#ADADAD"}
        >
          {t("Settings:AboutDataImport", {
            productName: t("Common:ProductName"),
            organizationName: t("Common:OrganizationName"),
          })}
        </Text>
        <Text
          className="data-import-counter"
          fontSize="16px"
          fontWeight={700}
          lineHeight="22px"
        >
          {currentStep}/{StepsData.length}. {StepsData[currentStep - 1].title}
        </Text>
        <div className="data-import-section-description">
          {StepsData[currentStep - 1].description}
        </div>
      </NextcloudWrapper>
      {StepsData[currentStep - 1].component}
    </>
  );
};

export default inject(({ setup, settingsStore, importAccountsStore }) => {
  const { clearCheckedAccounts, getMigrationStatus, setUsers, filteredUsers } =
    importAccountsStore;
  const { initSettings, viewAs, setViewAs } = setup;
  const { currentDeviceType } = settingsStore;

  return {
    initSettings,
    theme: settingsStore.theme,
    clearCheckedAccounts,
    viewAs,
    setViewAs,
    currentDeviceType,
    getMigrationStatus,
    setUsers,
    filteredUsers,
  };
})(
  withTranslation(["Common", "SMTPSettings", "Settings"])(
    observer(NextcloudWorkspace),
  ),
);
