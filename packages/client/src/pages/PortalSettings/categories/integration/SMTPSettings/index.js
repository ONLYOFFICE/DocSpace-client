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

import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { SettingsSMTPSkeleton } from "@docspace/shared/skeletons/settings";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import CustomSettings from "./sub-components/CustomSettings";
import { StyledComponent } from "./StyledComponent";

const SMTPSettings = (props) => {
  const {
    currentColorScheme,
    integrationSettingsUrl,
    logoText,
    showPortalSettingsLoader,
  } = props;

  const { t, ready } = useTranslation([
    "SMTPSettings",
    "Settings",
    "Common",
    "UploadPanel",
  ]);

  useEffect(() => {
    if (ready) setDocumentTitle(t("Settings:SMTPSettings"));
  }, [ready]);

  if (showPortalSettingsLoader) return <SettingsSMTPSkeleton />;

  return (
    <StyledComponent withoutExternalLink={!integrationSettingsUrl}>
      <div className="smtp-settings_main-title">
        <Text className="smtp-settings_description">
          {t("Settings:SMTPSettingsDescription", {
            organizationName: logoText,
          })}
        </Text>
        {integrationSettingsUrl ? (
          <Link
            className="link-learn-more"
            color={currentColorScheme.main?.accent}
            isHovered
            target="_blank"
            href={integrationSettingsUrl}
            dataTestId="integration_settings_link"
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </div>

      <CustomSettings t={t} />
    </StyledComponent>
  );
};

export default inject(({ settingsStore, setup, clientLoadingStore }) => {
  const { currentColorScheme, integrationSettingsUrl, logoText } =
    settingsStore;
  const { setInitSMTPSettings } = setup;

  const { showPortalSettingsLoader } = clientLoadingStore;

  return {
    setInitSMTPSettings,
    currentColorScheme,
    integrationSettingsUrl,
    logoText,
    showPortalSettingsLoader,
  };
})(observer(SMTPSettings));
