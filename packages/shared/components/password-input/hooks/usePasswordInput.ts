import { useCallback, useState, useEffect, ChangeEvent } from "react";

import { InputType } from "../../text-input";
import { TPasswordState } from "../PasswordInput.types";

export const usePasswordInput = (
  isSimulateType: boolean,
  simulateSymbol: string,
  simpleView: boolean,
  type: InputType.text | InputType.password,
  checkPassword: (
    value: string,
    setState: React.Dispatch<React.SetStateAction<TPasswordState>>,
  ) => void,
  setState: React.Dispatch<React.SetStateAction<TPasswordState>>,
  onChange?: (e: ChangeEvent<HTMLInputElement>, value?: string) => void,
  valueInput?: string,
) => {
  const [caretPosition, setCaretPosition] = useState<number | null>(null);

  const setPasswordSettings = useCallback(
    (newPassword: string) => {
      let newValue;

      if (!valueInput) return newPassword;

      const oldPassword = valueInput ?? "";
      const oldPasswordLength = oldPassword.length;
      const newCaretPosition = (
        document.getElementById("conversion-password") as HTMLInputElement
      )?.selectionStart;

      setCaretPosition(newCaretPosition);
      const newCharactersUntilCaret = newPassword.substring(
        0,
        newCaretPosition ?? undefined,
      );

      const unchangedStartCharacters = newCharactersUntilCaret
        .split("")
        .filter((el) => el === simulateSymbol).length;

      const unchangedEndingCharacters = newCaretPosition
        ? newPassword.substring(newCaretPosition).length
        : 0;
      const addedCharacters = newCharactersUntilCaret.substring(
        unchangedStartCharacters,
      );

      const startingPartOldPassword = oldPassword.substring(
        0,
        unchangedStartCharacters,
      );
      const countOfCharacters = oldPasswordLength - unchangedEndingCharacters;
      const endingPartOldPassword = oldPassword.substring(countOfCharacters);

      newValue = startingPartOldPassword + addedCharacters;

      if (unchangedEndingCharacters) {
        newValue += endingPartOldPassword;
      }

      return newValue;
    },
    [simulateSymbol, valueInput],
  );

  const onChangeAction = useCallback(
    (e: ChangeEvent<HTMLInputElement>, isGenerated?: boolean) => {
      let { value } = e.target;
      if (isSimulateType && !isGenerated) {
        value = setPasswordSettings(e.target.value);
      }

      onChange?.(e, value);

      if (simpleView) {
        setState((s) => ({
          ...s,
          value,
        }));
        return;
      }

      checkPassword(value, setState);
    },
    [
      isSimulateType,
      onChange,
      simpleView,
      checkPassword,
      setState,
      setPasswordSettings,
    ],
  );

  useEffect(() => {
    if (caretPosition && isSimulateType && type === InputType.password) {
      const input = document.getElementById(
        "conversion-password",
      ) as HTMLInputElement;
      input?.setSelectionRange(caretPosition, caretPosition);
    }
  }, [caretPosition, isSimulateType, type]);

  return {
    caretPosition,
    setCaretPosition,
    setPasswordSettings,
    onChangeAction,
  };
};
