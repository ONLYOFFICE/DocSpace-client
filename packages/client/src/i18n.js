import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "@docspace/shared/utils/i18next-http-backend";
import config from "PACKAGE_FILE";
import { LANGUAGE } from "@docspace/shared/constants";
import { getCookie } from "@docspace/shared/utils";

import { loadLanguagePath } from "./helpers/utils";

const newInstance = i18n.createInstance();

const userLng = window.navigator
  ? window.navigator.language ||
    window.navigator.systemLanguage ||
    window.navigator.userLanguage
  : "en";

const lng = getCookie(LANGUAGE) || userLng;

newInstance
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng,
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

    ns: [
      "ArchiveDialog",
      "InfoPanel",
      "InviteDialog",
      "FormGallery",
      "DownloadDialog",
      "DeleteDialog",
      "EmptyTrashDialog",
      "ConvertDialog",
      "ConnectDialog",
      "ConflictResolveDialog",
      "CreateEditRoomDialog",
      "DeleteThirdPartyDialog",
      "PortalUnavailable",
      "RoomSelector",
      "UploadPanel",
      "Files",
      "Errors",
      "Translations",
    ],

    backend: {
      loadPath: loadLanguagePath(config.homepage),
      allowMultiLoading: false,
      crossDomain: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default newInstance;
