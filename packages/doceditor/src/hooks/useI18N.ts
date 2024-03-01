import React from "react";
import { i18n } from "i18next";
import { TSettings } from "@docspace/shared/api/settings/types";
import { TUser } from "@docspace/shared/api/people/types";

import { getI18NInstance } from "@/utils/i18n";

interface UseI18NProps {
  settings?: TSettings;
  user?: TUser;
}

const useI18N = ({ settings, user }: UseI18NProps) => {
  const [i18n, setI18N] = React.useState<i18n>({} as i18n);

  const isInit = React.useRef(false);

  React.useEffect(() => {
    if (!settings?.timezone) return;
    window.timezone = settings.timezone;
  }, [settings?.timezone]);

  React.useEffect(() => {
    if (isInit.current || (!user?.cultureName && !settings?.culture)) return;

    isInit.current = true;

    const instance = getI18NInstance(
      user?.cultureName ?? "en",
      settings?.culture ?? "en",
    );

    if (instance) setI18N(instance);
  }, [settings?.culture, user?.cultureName]);

  return { i18n };
};

export default useI18N;
