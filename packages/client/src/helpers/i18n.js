import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "@docspace/shared/utils/i18next-http-backend";
import { LANGUAGE } from "@docspace/shared/constants";
import config from "PACKAGE_FILE";
import { getCookie } from "@docspace/shared/utils";

import { loadLanguagePath } from "./utils";

const newInstance = i18n.createInstance();

newInstance
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: getCookie(LANGUAGE) || "en",
    fallbackLng: "en",
    load: "currentOnly",
    //debug: true,

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
      format: function (value, format) {
        if (format === "lowercase") return value.toLowerCase();
        return value;
      },
    },

    backend: {
      loadPath: loadLanguagePath(config.homepage),
    },

    ns: ["Files", "Common"],
    defaultNS: "Files",

    react: {
      useSuspense: false,
    },
  });

export default newInstance;
