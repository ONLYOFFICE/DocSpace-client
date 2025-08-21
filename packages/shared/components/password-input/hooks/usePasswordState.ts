import { useState } from "react";
import { InputType } from "../../text-input";
import { TPasswordState } from "../PasswordInput.types";

export const usePasswordState = (
  inputType: InputType.text | InputType.password,
  inputValue?: string,
  clipActionResource?: string,
  emailInputName?: string,
) => {
  const [state, setState] = useState<TPasswordState>({
    type: inputType,
    value: inputValue,
    copyLabel: clipActionResource,
    disableCopyAction: !emailInputName,
    displayTooltip: false,
    validLength: false,
    validDigits: false,
    validCapital: false,
    validSpecial: false,
  });

  return { state, setState };
};
