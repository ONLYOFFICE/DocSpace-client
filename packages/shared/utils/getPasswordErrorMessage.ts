/* eslint-disable */

type TFunction = (str: string, options?: unknown) => string;
type TSettings = {
  minLength?: number;
  digits?: boolean;
  upperCase?: boolean;
  specSymbols?: boolean;
};

export const getPasswordErrorMessage = (t: TFunction, settings: TSettings) => {
  return `${t("Common:PasswordMinimumLength")} 
    ${settings ? settings?.minLength : 8
    } ${settings?.digits ? t("Common:PasswordLimitDigits") : ""} ${settings?.upperCase ? t("Common:PasswordLimitUpperCase") : ""
    } ${settings?.specSymbols
      ? `${t("Common:PasswordLimitSpecialSymbols")} (!@#$%^&*)`
      : ""
    }`;
};
