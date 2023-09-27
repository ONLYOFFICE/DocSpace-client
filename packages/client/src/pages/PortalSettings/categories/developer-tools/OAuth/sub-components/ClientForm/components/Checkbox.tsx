import Checkbox from "@docspace/components/checkbox";
import Text from "@docspace/components/text";

import { CheckboxRaw } from "../ClientForm.styled";
import { CheckboxProps } from "../ClientForm.types";

const CheckboxComponent = ({
  isChecked,
  onChange,
  label,
  description,
}: CheckboxProps) => {
  return (
    <CheckboxRaw>
      <Checkbox isChecked={isChecked} onChange={onChange} />
      <Text
        fontSize={"13px"}
        fontWeight={400}
        lineHeight={"20px"}
        title={label}
        tag={""}
        as={"p"}
        color={""}
        textAlign={""}
      >
        {label}
      </Text>
      <Text
        fontSize={"13px"}
        fontWeight={400}
        lineHeight={"20px"}
        title={label}
        tag={""}
        as={"p"}
        color={"#A3A9AE"}
        textAlign={""}
      >
        {description}
      </Text>
    </CheckboxRaw>
  );
};

export default CheckboxComponent;
