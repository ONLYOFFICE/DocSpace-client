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

import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";

import StyledComponent from "../StyledComponent";

const OfficialDocumentation = ({ dataBackupUrl }) => {
  const { t } = useTranslation("PaymentsEnterprise");

  const dockerLink =
    "https://helpcenter.onlyoffice.com/installation/docspace-enterprise-install-script.aspx";
  const linuxDocker =
    "https://helpcenter.onlyoffice.com/installation/docspace-enterprise-install-script.aspx";
  const windowsDocker =
    "https://helpcenter.onlyoffice.com/installation/docspace-enterprise-install-windows.aspx";

  return (
    <StyledComponent>
      <div className="official-documentation">
        —
        <Text fontWeight={600}>
          {t("UpgradeToProBannerInstructionItemDocker")}{" "}
          <ColorTheme
            tag="a"
            themeId={ThemeId.Link}
            fontSize="13px"
            fontWeight="600"
            href={dockerLink}
            target="_blank"
          >
            {t("UpgradeToProBannerInstructionReadNow")}
          </ColorTheme>
        </Text>
        —
        <Text fontWeight={600}>
          {t("UpgradeToProBannerInstructionItemLinux")}{" "}
          <ColorTheme
            tag="a"
            themeId={ThemeId.Link}
            fontSize="13px"
            fontWeight="600"
            href={linuxDocker}
            target="_blank"
          >
            {t("UpgradeToProBannerInstructionReadNow")}
          </ColorTheme>
        </Text>
        —
        <Text fontWeight={600}>
          {t("UpgradeToProBannerInstructionItemWindows")}{" "}
          <ColorTheme
            tag="a"
            themeId={ThemeId.Link}
            fontSize="13px"
            fontWeight="600"
            href={windowsDocker}
            target="_blank"
          >
            {t("UpgradeToProBannerInstructionReadNow")}
          </ColorTheme>
        </Text>
      </div>

      <Text className="upgrade-info">
        <Trans
          i18nKey="UpgradeToProBannerInstructionNote"
          ns="PaymentsEnterprise"
          t={t}
        >
          Please note that the editors will be unavailable during the upgrade.
          We also recommend to
          <ColorTheme
            tag="a"
            themeId={ThemeId.Link}
            fontWeight="600"
            href={dataBackupUrl}
            target="_blank"
          >
            backup your data
          </ColorTheme>
          before you start.
        </Trans>
      </Text>
    </StyledComponent>
  );
};

export default inject(({ settingsStore }) => {
  const { dataBackupUrl } = settingsStore;

  return { dataBackupUrl };
})(observer(OfficialDocumentation));
