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

import { Trans } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { HelpButton } from "@docspace/ui-kit/components/help-button";

import UserSolidIcon from "PUBLIC_DIR/images/icons/16/catalog.user.solid.react.svg?url";
import SharedIcon from "PUBLIC_DIR/images/icons/16/catalog.shared.react.svg?url";
import type { TFunction } from "i18next";
import SelectFileStep from "../../components/SelectFileStep";
import SelectUsersStep from "../../components/SelectUsersStep";
import SelectUsersTypeStep from "../../components/SelectUsersTypeStep";
import ImportStep from "../../components/ImportStep";
import ImportProcessingStep from "../../components/ImportProcessingStep";
import ImportCompleteStep from "../../components/ImportCompleteStep";
import { getBrandName } from "@docspace/shared/constants/brands";

export const getStepsData = (
  t: TFunction,
  isTypeSelectEmpty: boolean,
  logoText: string,
) => {
  return [
    {
      title: t("Common:SelectFile"),
      description: t("Settings:SelectFileDescriptionWorkspace", {
        productName: getBrandName("ProductName"),
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
        productName: getBrandName("ProductName"),
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
              productName: getBrandName("ProductName"),
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
              productName: getBrandName("ProductName"),
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
                  values={{ productName: getBrandName("ProductName") }}
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
        productName: getBrandName("ProductName"),
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
        productName: getBrandName("ProductName"),
        organizationName: logoText,
      }),
      component: <ImportCompleteStep t={t} />,
    },
  ];
};
