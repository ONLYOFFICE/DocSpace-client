import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "@docspace/shared/utils/i18next-http-backend";
import { LANGUAGE } from "@docspace/shared/constants";
import config from "PACKAGE_FILE";
import { getLtrLanguageForEditor } from "@docspace/shared/utils/common";
import { loadLanguagePath } from "SRC_DIR/helpers/utils";
import { getCookie } from "@docspace/shared/utils";

const newInstance = i18n.createInstance();

const userLng = getCookie(LANGUAGE) || "en";
const portalLng = window?.__ASC_INITIAL_EDITOR_STATE__?.portalSettings?.culture;

newInstance
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: getLtrLanguageForEditor(userLng, portalLng),
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

    ns: [
      "SharingPanel",
      "Common",
      "Translations",
      "EmbeddingPanel",
      "Files",
      "ChangeOwnerPanel",
    ],
    defaultNS: "SharingPanel",

    react: {
      useSuspense: false,
    },
  });

export default newInstance;
