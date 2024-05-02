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

import SelectFileStep from "./SelectFileStep";
import SelectUsersStep from "./SelectUsersStep";
import AddEmailsStep from "./AddEmailsStep";
import SelectUsersTypeStep from "./SelectUsersTypeStep";
import ImportStep from "./ImportStep";
import ImportProcessingStep from "./ImportProcessingStep";
import ImportCompleteStep from "./ImportCompleteStep";

import { HelpButton } from "@docspace/shared/components/help-button";
import { Text } from "@docspace/shared/components/text";

import { Trans } from "react-i18next";

export const getStepsData = (t, currentStep, setCurrentStep) => {
  const isSixthStep = currentStep === 6;

  const incrementStep = () => {
    setCurrentStep((prev) => {
      const nextStep = prev < 7 ? prev + 1 : 7;
      return nextStep;
    });
  };

  const decrementStep = () => {
    if (currentStep !== 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return [
    {
      title: t("Common:SelectFile"),
      description: t("Settings:SelectFileDescriptionNextcloud"),
      component: (
        <SelectFileStep
          t={t}
          incrementStep={incrementStep}
          decrementStep={decrementStep}
        />
      ),
    },
    {
      title: t("Settings:SelectUsersWithEmail"),
      description: t("Settings:SelectUsersDescriptionNextcloud"),
      component: (
        <SelectUsersStep
          t={t}
          incrementStep={incrementStep}
          decrementStep={decrementStep}
        />
      ),
    },
    {
      title: t("Settings:AddEmails"),
      description: t("Settings:AddEmailsDescription"),
      component: (
        <AddEmailsStep
          t={t}
          incrementStep={incrementStep}
          decrementStep={decrementStep}
        />
      ),
    },
    {
      title: t("Settings:SelectUserTypes"),
      description: (
        <>
          <Trans t={t} ns="Settings" i18nKey="SelectUserTypesDescription">
            Select DocSpace roles for the imported users: <b>DocSpace admin</b>,{" "}
            <b>Room admin</b>
            or <b>Power user</b>. By default, Power user role is selected for
            each user. You can manage the roles after the import.
          </Trans>
          <HelpButton
            place="bottom"
            offsetRight={0}
            tooltipContent={
              <Text>
                <Trans
                  i18nKey="TypesAndPrivileges"
                  ns="Settings"
                  t={t}
                  components={{
                    1: <b></b>,
                    2: <b></b>,
                    3: <b></b>,
                    4: <b></b>,
                  }}
                />
              </Text>
            }
            style={{
              display: "inline-block",
              position: "relative",
              bottom: "-2px",
              margin: "0px 5px",
            }}
          />
        </>
      ),
      component: (
        <SelectUsersTypeStep
          t={t}
          incrementStep={incrementStep}
          decrementStep={decrementStep}
        />
      ),
    },
    {
      title: t("Settings:DataImport"),
      description: t("Settings:ImportSectionDescription"),
      component: (
        <ImportStep
          t={t}
          incrementStep={incrementStep}
          decrementStep={decrementStep}
        />
      ),
    },
    {
      title: t("Settings:DataImportProcessing"),
      description: t("Settings:ImportProcessingDescription"),
      component: (
        <ImportProcessingStep
          t={t}
          incrementStep={incrementStep}
          decrementStep={decrementStep}
          isSixthStep={isSixthStep}
        />
      ),
    },
    {
      title: t("Settings:DataImportComplete"),
      description: t("Settings:ImportCompleteDescriptionNextcloud"),
      component: (
        <ImportCompleteStep
          t={t}
          incrementStep={incrementStep}
          decrementStep={decrementStep}
        />
      ),
    },
  ];
};
