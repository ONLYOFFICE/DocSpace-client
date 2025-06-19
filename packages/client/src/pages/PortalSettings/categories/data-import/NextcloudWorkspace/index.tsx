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

import { useLayoutEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import type { TFunction } from "i18next";
import { getStepsData } from "./Stepper";

import SelectFileLoader from "../sub-components/SelectFileLoader";
import StepLayout from "../sub-components/StepLayout";

import { InjectedWorkspaceProps, WorkspaceProps } from "../types";

const NextcloudWorkspace = (props: WorkspaceProps) => {
  const {
    theme,
    filteredUsers,
    step,
    setStep,
    migratingWorkspace,
    migrationPhase,
    isMigrationInit,
    setIsMigrationInit,
    logoText,
  } = props as InjectedWorkspaceProps;

  const { t, ready }: { t: TFunction; ready: boolean } = useTranslation([
    "Common",
    "SMTPSettings",
    "Settings",
  ]);

  const StepsData = getStepsData(t, filteredUsers.length === 0, logoText);

  useLayoutEffect(() => {
    if (migratingWorkspace === "Nextcloud" && !isMigrationInit) {
      if (migrationPhase === "setup") {
        setStep(2);
      } else if (migrationPhase === "migrating") {
        setStep(6);
      } else if (migrationPhase === "complete") {
        setStep(7);
      }
      setIsMigrationInit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return <SelectFileLoader />;

  return (
    <StepLayout
      t={t}
      theme={theme}
      step={step}
      totalSteps={StepsData.length}
      title={StepsData[step - 1].title}
      description={StepsData[step - 1].description as string}
      component={StepsData[step - 1].component}
      logoText={logoText}
    />
  );
};

export const Component = inject<TStore>(
  ({ settingsStore, importAccountsStore }) => {
    const {
      filteredUsers,
      step,
      setStep,
      setWorkspace,
      migratingWorkspace,
      migrationPhase,
      isMigrationInit,
      setIsMigrationInit,
    } = importAccountsStore;
    const { theme, logoText } = settingsStore;

    return {
      theme,
      filteredUsers,
      step,
      setStep,
      setWorkspace,
      migratingWorkspace,
      migrationPhase,
      isMigrationInit,
      setIsMigrationInit,
      logoText,
    };
  },
)(observer(NextcloudWorkspace));
