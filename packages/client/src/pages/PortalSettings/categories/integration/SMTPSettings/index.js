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
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";

import CustomSettings from "./sub-components/CustomSettings";
import { StyledComponent } from "./StyledComponent";
import { SettingsSMTPSkeleton } from "@docspace/shared/skeletons/settings";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";

let timerId = null;
const SMTPSettings = (props) => {
  const {
    setInitSMTPSettings,
    organizationName,
    currentColorScheme,
    integrationSettingsUrl,
  } = props;

  const { t, ready } = useTranslation([
    "SMTPSettings",
    "Settings",
    "Common",
    "UploadPanel",
  ]);
  const [isInit, setIsInit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const init = async () => {
    await setInitSMTPSettings();

    setIsLoading(false);
    setIsInit(true);
  };
  useEffect(() => {
    setDocumentTitle(t("Settings:SMTPSettings"));

    timerId = setTimeout(() => {
      setIsLoading(true);
    }, 400);

    init();

    () => {
      clearTimeout(timerId);
      timerId = null;
    };
  }, []);

  const isLoadingContent = isLoading || !ready;

  if (!isLoading && !isInit) return <></>;

  if (isLoadingContent && !isInit) return <SettingsSMTPSkeleton />;

  return (
    <StyledComponent>
      <div className="smtp-settings_main-title">
        <Text className="smtp-settings_description">
          {t("Settings:SMTPSettingsDescription", { organizationName })}
        </Text>
        <Link
          className="link-learn-more"
          color={currentColorScheme.main?.accent}
          isHovered
          target="_blank"
          href={integrationSettingsUrl}
        >
          {t("Common:LearnMore")}
        </Link>
      </div>

      <CustomSettings t={t} />
    </StyledComponent>
  );
};

export default inject(({ settingsStore, setup }) => {
  const { organizationName, currentColorScheme, integrationSettingsUrl } =
    settingsStore;
  const { setInitSMTPSettings } = setup;

  return {
    setInitSMTPSettings,
    organizationName,
    currentColorScheme,
    integrationSettingsUrl,
  };
})(observer(SMTPSettings));
