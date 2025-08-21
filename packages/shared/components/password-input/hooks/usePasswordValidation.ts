import { useCallback } from "react";
import {
  TPasswordSettings,
  TPasswordState,
  TPasswordValidation,
} from "../PasswordInput.types";

export const usePasswordValidation = (
  passwordSettings: TPasswordSettings,
  onValidateInput?: (
    progressScore: boolean,
    passwordValidation: TPasswordValidation,
  ) => void,
) => {
  const testStrength = useCallback(
    (value: string): TPasswordValidation => {
      if (!passwordSettings) return {} as TPasswordValidation;

      const capitalRegExp = new RegExp(
        passwordSettings.upperCaseRegexStr || "",
      );
      const digitalRegExp = new RegExp(passwordSettings.digitsRegexStr || "");
      const specSymbolsRegExp = new RegExp(
        passwordSettings.specSymbolsRegexStr || "",
      );

      let capital = true;
      let digits = true;
      let special = true;
      let allowed = true;
      let length = true;

      if (passwordSettings.upperCase) {
        capital = capitalRegExp.test(value);
      }

      if (passwordSettings.digits) {
        digits = digitalRegExp.test(value);
      }

      if (passwordSettings.specSymbols) {
        special = specSymbolsRegExp.test(value);
      }

      if (passwordSettings.allowedCharactersRegexStr) {
        const allowedRegExp = new RegExp(
          `^${passwordSettings.allowedCharactersRegexStr}{1,}$`,
        );
        allowed = allowedRegExp.test(value);
      }

      if (passwordSettings?.minLength !== undefined) {
        length = value.trim().length >= passwordSettings.minLength;
      }

      return {
        allowed,
        digits,
        capital,
        special,
        length,
      };
    },
    [passwordSettings],
  );

  const checkPassword = useCallback(
    (
      value: string,
      setState: React.Dispatch<React.SetStateAction<TPasswordState>>,
    ) => {
      const passwordValidation = testStrength(value);
      const progressScore = Object.values(passwordValidation).every(Boolean);

      onValidateInput?.(progressScore, passwordValidation);

      setState((s: TPasswordState) => ({
        ...s,
        value,
        validLength: passwordValidation.length || false,
        validDigits: passwordValidation.digits || false,
        validCapital: passwordValidation.capital || false,
        validSpecial: passwordValidation.special || false,
      }));
    },
    [onValidateInput, testStrength],
  );

  return { testStrength, checkPassword };
};
