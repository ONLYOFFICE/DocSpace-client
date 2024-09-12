import { tfaAppValidate } from "./tfaAppValidate";

export {
  colorTheme as colorThemeHandler,
  getSuccessColorTheme,
} from "./colorTheme";
export {
  licenseRequired as licenseRequiredHandler,
  licenseRequiredSuccess,
  licenseNotRequiredSuccess,
} from "./licenseRequired";
export {
  machineName as machineNameHandler,
  machineNameSuccess,
} from "./machineName";
export {
  portalCultures as portalCulturesHandler,
  portalCulturesSuccess,
} from "./portalCultures";
export {
  portalPasswordSettings as portalPasswordSettingHandler,
  portalPasswordSettingsSuccess,
} from "./portalPasswordSettings";
export {
  portalTimeZone as portalTimeZoneHandler,
  portalTimeZonesSuccess,
} from "./portalTimeZones";
export {
  settings as settingsHandler,
  settingsWizzard,
  settingsAuth,
  settingsNoAuth,
} from "./settings";

export {
  complete as completeHandler,
  completeSuccess,
  PATH as COMPLETE_PATH,
} from "./complete";
export {
  license as licenseHandler,
  licenseSuccess,
  PATH as LICENCE_PATH,
} from "./license";

export { tfaApp as tfaAppHandler, tfaAppSuccess } from "./tfaApp";
export {
  tfaAppValidate as tfaAppValidateHandler,
  tfaAppValidateSuccess,
  PATH as TFA_APP_VALIDATE_PATH,
} from "./tfaAppValidate";
