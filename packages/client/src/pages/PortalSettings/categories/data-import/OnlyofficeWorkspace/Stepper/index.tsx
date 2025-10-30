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

import { Trans } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { HelpButton } from "@docspace/shared/components/help-button";

import UserSolidIcon from "PUBLIC_DIR/images/icons/16/catalog.user.solid.react.svg?url";
import SharedIcon from "PUBLIC_DIR/images/icons/16/catalog.shared.react.svg?url";
import type { TFunction } from "i18next";
import SelectFileStep from "../../components/SelectFileStep";
import SelectUsersStep from "../../components/SelectUsersStep";
import SelectUsersTypeStep from "../../components/SelectUsersTypeStep";
import ImportStep from "../../components/ImportStep";
import ImportProcessingStep from "../../components/ImportProcessingStep";
import ImportCompleteStep from "../../components/ImportCompleteStep";

export const getStepsData = (
  t: TFunction,
  isTypeSelectEmpty: boolean,
  logoText: string,
) => {
  return [
    {
      title: t("Common:SelectFile"),
      description: t("Settings:SelectFileDescriptionWorkspace", {
        productName: t("Common:ProductName"),
        organizationName: logoText,
      }),
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
      description: t("Settings:SelectUsersDescriptionWorkspace", {
        productName: t("Common:ProductName"),
        organizationName: logoText,
      }),
      component: <SelectUsersStep t={t} canDisable shouldSetUsers />,
    },
    {
      title: t("Settings:SelectUserTypes"),
      description: isTypeSelectEmpty ? (
        <>
          <b>{t("Settings:RolesAreSet")}</b>
          <div>
            {t("Settings:UsersAreRegistered", {
              productName: t("Common:ProductName"),
            })}
          </div>
        </>
      ) : (
        <>
          <Trans
            t={t}
            ns="Settings"
            i18nKey="SelectUserTypesDescription"
            values={{
              productName: t("Common:ProductName"),
            }}
            components={{
              1: <b />,
            }}
          />
          <HelpButton
            place="bottom"
            offsetRight={0}
            tooltipContent={
              <Text>
                <Trans
                  i18nKey="TypesAndPrivileges"
                  ns="Settings"
                  t={t}
                  values={{ productName: t("Common:ProductName") }}
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
            dataTestId="types_and_privileges_help_button"
          />
        </>
      ),
      component: <SelectUsersTypeStep t={t} />,
    },
    {
      title: t("Settings:DataImport"),
      description: t("Settings:ImportSectionDescription", {
        productName: t("Common:ProductName"),
        organizationName: logoText,
      }),
      component: (
        <ImportStep
          t={t}
          serviceName={`${logoText} Workspace`}
          usersExportDetails={{
            name: t("Common:People"),
            icon: UserSolidIcon,
          }}
          personalExportDetails={{
            name: t("Common:MyDocuments"),
            icon: UserSolidIcon,
          }}
          sharedFilesAndFoldersExportDetails={{
            name: t("Common:SharedWithMe"),
            icon: SharedIcon,
          }}
          hasCommonFiles
          hasProjectFiles
        />
      ),
    },
    {
      title: t("Settings:DataImportProcessing"),
      description: t("Settings:ImportProcessingDescription"),
      component: <ImportProcessingStep t={t} migratorName="Workspace" />,
    },
    {
      title: t("Settings:DataImportComplete"),
      description: t("Settings:ImportCompleteDescriptionWorkspace", {
        productName: t("Common:ProductName"),
        organizationName: logoText,
      }),
      component: <ImportCompleteStep t={t} />,
    },
  ];
};
