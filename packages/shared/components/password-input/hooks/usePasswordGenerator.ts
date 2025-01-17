import { ChangeEvent, MouseEvent, useCallback } from "react";

import { InputType } from "../../text-input";
import { TPasswordSettings, TPasswordState } from "../PasswordInput.types";

const CHARACTER_SETS = {
  LOWERCASE: "abcdefghijklmnopqrstuvwxyz",
  NUMBERS: "0123456789",
} as {
  LOWERCASE: string;
  NUMBERS: string;
};

export const usePasswordGenerator = (
  generatorSpecial: string,
  passwordSettings: TPasswordSettings,
  isDisabled: boolean,
  type: InputType.text | InputType.password,
  onChangeAction: (
    e: ChangeEvent<HTMLInputElement>,
    isGenerated?: boolean,
  ) => void,
  checkPassword: (
    value: string,
    setState: React.Dispatch<React.SetStateAction<TPasswordState>>,
  ) => void,
  setState: React.Dispatch<React.SetStateAction<TPasswordState>>,
) => {
  const generateRandomChar = useCallback((charset: string): string => {
    const randomIndex = Math.floor(Math.random() * charset.length);
    return charset.charAt(randomIndex);
  }, []);

  const getNewPassword = useCallback(() => {
    const length = passwordSettings?.minLength || 8;
    const chars: string[] = [];

    // Add required character types based on settings
    if (passwordSettings?.upperCase) {
      chars.push(generateRandomChar(CHARACTER_SETS.LOWERCASE).toUpperCase());
    }
    if (passwordSettings?.digits) {
      chars.push(generateRandomChar(CHARACTER_SETS.NUMBERS));
    }
    if (passwordSettings?.specSymbols && generatorSpecial) {
      chars.push(generateRandomChar(generatorSpecial));
    }

    // Fill remaining length with random characters
    while (chars.length < length) {
      const charTypes = [CHARACTER_SETS.LOWERCASE];

      if (passwordSettings?.upperCase) {
        charTypes.push(CHARACTER_SETS.LOWERCASE.toUpperCase());
      }
      if (passwordSettings?.digits) {
        charTypes.push(CHARACTER_SETS.NUMBERS);
      }
      if (passwordSettings?.specSymbols && generatorSpecial) {
        charTypes.push(generatorSpecial);
      }

      const randomCharSet =
        charTypes[Math.floor(Math.random() * charTypes.length)];
      chars.push(generateRandomChar(randomCharSet));
    }

    // Shuffle the array to ensure randomness
    return chars
      .sort(() => Math.random() - 0.5)
      .join("")
      .slice(0, length);
  }, [
    generateRandomChar,
    generatorSpecial,
    passwordSettings?.digits,
    passwordSettings?.minLength,
    passwordSettings?.specSymbols,
    passwordSettings?.upperCase,
  ]);

  const onGeneratePassword = useCallback(
    (e: MouseEvent) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }

      const newPassword = getNewPassword();

      if (type !== InputType.text) {
        setState((s) => ({
          ...s,
          type: InputType.text,
        }));
      }

      checkPassword(newPassword, setState);
      onChangeAction(
        {
          target: { value: newPassword },
        } as ChangeEvent<HTMLInputElement>,
        true,
      );
    },
    [checkPassword, getNewPassword, isDisabled, onChangeAction, setState, type],
  );

  return { onGeneratePassword };
};
