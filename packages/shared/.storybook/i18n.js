import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import i18n from "i18next";

const newInstance = i18n.createInstance();

newInstance
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    load: "currentOnly",
    ns: ["Common", "PreparationPortal"],
    defaultNS: "Common",
    fallbackNS: ["Common"],
    backend: {
      // Route Common from the shared public dir ('/locales/...')
      // and other namespaces from packages/client/public mounted at '/client-public'
      loadPath: (lngs, namespaces) => {
        const ns = Array.isArray(namespaces) ? namespaces[0] : namespaces;
        return ns === "Common"
          ? "/locales/{{lng}}/{{ns}}.json"
          : "/client-public/locales/{{lng}}/{{ns}}.json";
      },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default newInstance;
