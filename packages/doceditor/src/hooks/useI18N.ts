import React from "react";

import { UseI18NProps } from "@/types";
import { getI18NInstance } from "@/utils/i18n";
import { i18n } from "i18next";

const useI18N = ({ settings, user }: UseI18NProps) => {
  const [i18n, setI18N] = React.useState<i18n | null>(null);

  const isInit = React.useRef(false);

  React.useEffect(() => {
    window.timezone = settings.timezone;
  }, [settings.timezone]);

  React.useEffect(() => {
    if (isInit.current) return;
    isInit.current = true;
    const instance = getI18NInstance(
      user.cultureName || "en",
      settings.culture,
    );

    setI18N(instance);
  }, [settings.culture, user.cultureName]);

  return { i18n };
};

export default useI18N;
