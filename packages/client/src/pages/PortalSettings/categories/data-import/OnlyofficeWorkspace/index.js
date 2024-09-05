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
import { Trans, withTranslation } from "react-i18next";
import { getStepTitle, getWorkspaceStepDescription } from "../../../utils";
import {
  tablet,
  isMobile as isMobileBreakpoint,
} from "@docspace/shared/utils/device";
import { isMobile } from "react-device-detect";
import useViewEffect from "SRC_DIR/Hooks/useViewEffect";
import styled, { css } from "styled-components";
import { useNavigate } from "react-router-dom";

import StepContent from "./Stepper";
import SelectFileLoader from "../sub-components/SelectFileLoader";
import BreakpointWarning from "SRC_DIR/components/BreakpointWarning";
import { Text } from "@docspace/shared/components/text";
import { Box } from "@docspace/shared/components/box";
import { HelpButton } from "@docspace/shared/components/help-button";
import { toastr } from "@docspace/shared/components/toast";

const STEP_LENGTH = 6;

const WorkspaceWrapper = styled.div`
  margin-top: 4px;

  .workspace-subtitle {
    color: ${(props) => props.theme.client.settings.migration.descriptionColor};
    max-width: 700px;
    line-height: 20px;
    margin-bottom: 20px;

    @media ${tablet} {
      max-width: 675px;
    }
  }

  .step-counter {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 5px;
          `
        : css`
            margin-right: 5px;
          `}

    font-size: 16px;
    font-weight: 700;
    color: ${(props) => props.theme.client.settings.migration.subtitleColor};
  }

  .step-title {
    font-size: 16px;
    font-weight: 700;
    color: ${(props) => props.theme.client.settings.migration.subtitleColor};
  }

  .step-description {
    max-width: 700px;
    font-size: 12px;
    margin-bottom: 16px;
    line-height: 16px;
    color: ${(props) =>
      props.theme.client.settings.migration.stepDescriptionColor};

    @media ${tablet} {
      max-width: 675px;
    }
  }
`;

const OnlyofficeWorkspace = ({
  t,
  clearCheckedAccounts,
  viewAs,
  setViewAs,
  currentDeviceType,
  getMigrationStatus,
  setUsers,
  filteredUsers,
}) => {
  const [showReminder, setShowReminder] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [shouldRender, setShouldRender] = useState(false);
  const navigate = useNavigate();

  const onNextStep = () => {
    setCurrentStep((prev) => {
      const nextStep = prev < 6 ? prev + 1 : 6;
      return nextStep;
    });
  };

  const onPrevStep = () => {
    if (currentStep !== 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const helpContent = () => (
    <Text fontSize="12px">
      <Trans
        i18nKey="TypesAndPrivileges"
        ns="Settings"
        t={t}
        values={{ productName: t("Common:ProductName") }}
        components={{
          1: <strong></strong>,
          2: <strong></strong>,
          3: <strong></strong>,
          4: <strong></strong>,
        }}
      />
    </Text>
  );

  const tooltipStyle = {
    display: "inline-block",
    position: "relative",
    bottom: "-2px",
    margin: "0px 5px",
  };

  const renderTooltip = (
    <HelpButton
      place="bottom"
      offsetRight={0}
      getContent={helpContent}
      style={tooltipStyle}
    />
  );

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

        if (res.parseResult.migratorName !== "Workspace") {
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

        if (
          res.parseResult.operation === "parse" &&
          res.isCompleted &&
          res.error
        ) {
          setUsers(res.parseResult);
          setCurrentStep(2);
        }

        if (res.parseResult.operation === "migration" && !res.isCompleted) {
          setCurrentStep(5);
        }

        if (res.parseResult.operation === "migration" && res.isCompleted) {
          setCurrentStep(6);
        }
        setShouldRender(true);
      });
    } catch (error) {
      toastr.error(error);
    }

    return clearCheckedAccounts;
  }, []);

  if (isMobileBreakpoint()) {
    return (
      <BreakpointWarning
        isMobileUnavailableOnly
        sectionName={t("Settings:DataImport")}
      />
    );
  }

  if (!shouldRender) return <SelectFileLoader />;

  return (
    <WorkspaceWrapper>
      <Text className="workspace-subtitle">
        {t("Settings:AboutDataImport", {
          productName: t("Common:ProductName"),
          organizationName: t("Common:OrganizationName"),
        })}
      </Text>
      <div className="step-container">
        <Box displayProp="flex" marginProp="0 0 8px">
          <Text className="step-counter">
            {currentStep}/{STEP_LENGTH}.
          </Text>
          <Text className="step-title">{getStepTitle(t, currentStep)}</Text>
        </Box>
        <Box className="step-description">
          {getWorkspaceStepDescription(
            t,
            currentStep,
            renderTooltip,
            Trans,
            filteredUsers.length === 0,
            t("Common:OrganizationName"),
          )}
        </Box>
        <StepContent
          t={t}
          currentStep={currentStep}
          onNextStep={onNextStep}
          onPrevStep={onPrevStep}
          showReminder={showReminder}
          setShowReminder={setShowReminder}
        />
      </div>
    </WorkspaceWrapper>
  );
};

export default inject(({ setup, settingsStore, importAccountsStore }) => {
  const { clearCheckedAccounts, getMigrationStatus, setUsers, filteredUsers } =
    importAccountsStore;
  const { viewAs, setViewAs } = setup;
  const { currentDeviceType } = settingsStore;

  return {
    clearCheckedAccounts,
    viewAs,
    setViewAs,
    currentDeviceType,
    getMigrationStatus,
    setUsers,
    filteredUsers,
  };
})(withTranslation(["Common", "Settings"])(observer(OnlyofficeWorkspace)));
