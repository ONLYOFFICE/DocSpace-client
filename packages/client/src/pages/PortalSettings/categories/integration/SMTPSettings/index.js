import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";

import CustomSettings from "./sub-components/CustomSettings";
import { StyledComponent } from "./StyledComponent";
import Loaders from "@docspace/common/components/Loaders";
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

  if (isLoadingContent && !isInit) return <Loaders.SettingsSMTP />;

  return (
    <StyledComponent>
      <div className="smtp-settings_main-title">
        <Text className="smtp-settings_description">
          {t("Settings:SMTPSettingsDescription", { organizationName })}
        </Text>
        <Link
          className="link-learn-more"
          color={currentColorScheme.main.accent}
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
