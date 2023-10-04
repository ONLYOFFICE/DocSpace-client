import copy from "copy-to-clipboard";

import InputBlock from "@docspace/components/input-block";
import Button from "@docspace/components/button";
// @ts-ignore
import toastr from "@docspace/components/toast/toastr";

import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";

import { InputProps } from "../ClientForm.types";
import { InputRaw } from "../ClientForm.styled";

const Input = ({
  value,
  placeholder,
  name,
  onChange,
  isReadOnly,
  isSecret,
  withCopy,
  withButton,
  buttonLabel,
  onClickButton,
  multiplyInput,
}: InputProps) => {
  const onCopy = () => {
    if (value) {
      toastr.success(
        isSecret
          ? "Secret has been copied to the clipboard"
          : "ID has been copied to the clipboard"
      );
      copy(value);
    }
  };

  return (
    <InputRaw>
      <InputBlock
        value={value}
        name={name}
        placeholder={placeholder}
        onChange={onChange}
        size={"base"}
        isReadOnly={isReadOnly}
        isDisabled={isReadOnly}
        iconName={withCopy ? CopyReactSvgUrl : null}
        onIconClick={withCopy && onCopy}
        scale={true}
        type={isSecret ? "password" : "text"}
      />

      {withButton && (
        <Button
          //@ts-ignore
          label={buttonLabel}
          size={"small"}
          onClick={onClickButton}
        />
      )}
    </InputRaw>
  );
};

export default Input;
