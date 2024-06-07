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

import { Trans } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { HelpButton } from "@docspace/shared/components/help-button";

import SelectFileStep from "../../components/SelectFileStep";

import SelectUsersStep from "./SelectUsersStep";
import SelectUsersTypeStep from "./SelectUsersTypeStep";
import ImportStep from "./ImportStep";
import ImportProcessingStep from "./ImportProcessingStep";
import ImportCompleteStep from "./ImportCompleteStep";

import { TFunciton } from "../../types";

export const getStepsData = (
  t: TFunciton,
  incrementStep: () => void,
  decrementStep: () => void,
  isTypeSelectEmpty: boolean,
) => {
  return [
    {
      title: t("Common:SelectFile"),
      description: t("Settings:SelectFileDescriptionWorkspace"),
      component: (
        <SelectFileStep
          t={t}
          isMultipleUpload
          migratorName="Workspace"
          acceptedExtensions={[".gz", ".tar", ".tar.gz"]}
        />
      ),
    },
    {
      title: t("Settings:SelectUsers"),
      description: t("Settings:SelectUsersDescriptionWorkspace"),
      component: (
        <SelectUsersStep
          t={t}
          onNextStep={incrementStep}
          onPrevStep={decrementStep}
        />
      ),
    },
    {
      title: t("Settings:SelectUserTypes"),
      description: isTypeSelectEmpty ? (
        <>
          <b>{t("Settings:RolesAreSet")}</b>
          <div>{t("Settings:UsersAreRegistered")}</div>
        </>
      ) : (
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
                    1: <b />,
                    2: <b />,
                    3: <b />,
                    4: <b />,
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
          onNextStep={incrementStep}
          onPrevStep={decrementStep}
          showReminder
        />
      ),
    },
    {
      title: t("Settings:DataImport"),
      description: t("Settings:ImportSectionDescription"),
      component: (
        <ImportStep
          t={t}
          onNextStep={incrementStep}
          onPrevStep={decrementStep}
          showReminder
        />
      ),
    },
    {
      title: t("Settings:DataImportProcessing"),
      description: t("Settings:ImportProcessingDescription"),
      component: <ImportProcessingStep t={t} onNextStep={incrementStep} />,
    },
    {
      title: t("Settings:DataImportComplete"),
      description: t("Settings:ImportCompleteDescriptionWorkspace"),
      component: <ImportCompleteStep t={t} />,
    },
  ];
};
