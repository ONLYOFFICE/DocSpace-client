import React from "react";
import { StyledBlock, StyledInputBlock } from "../ClientForm.styled";

import BlockHeader from "./BlockHeader";
import InputGroup from "./InputGroup";
import TextAreaGroup from "./TextAreaGroup";
import SelectGroup from "./SelectGroup";

interface BasicBlockProps {
  t: any;

  nameValue: string;
  websiteUrlValue: string;
  logoValue: string;
  descriptionValue: string;

  changeValue: (name: string, value: string) => void;
}

const BasicBlock = ({
  t,
  nameValue,
  websiteUrlValue,
  logoValue,
  descriptionValue,
  changeValue,
}: BasicBlockProps) => {
  const [value, setValue] = React.useState<{ [key: string]: string }>({
    name: nameValue,
    websiteUrl: websiteUrlValue,
    logo: logoValue,
    description: descriptionValue,
  });

  const [error, setError] = React.useState({
    name: "",
    websiteUrl: "",
    logo: "",
    description: "",
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;

    setValue((value) => {
      value[target.name] = target.value;

      return { ...value };
    });

    changeValue(target.name, target.value);
  };

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file =
      e.target.files && e.target.files?.length > 0 && e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        const result = reader.result as string;

        setValue((v) => ({ ...v, logo: result }));
        changeValue("logo", result);
      };
    }
  };

  return (
    <StyledBlock>
      <BlockHeader header={"Basic info"} />
      <StyledInputBlock>
        <InputGroup
          label={"App name"}
          name={"name"}
          placeholder={"Enter name"}
          value={value.name}
          error={error.name}
          onChange={onChange}
        />
        <InputGroup
          label={"Website URL"}
          name={"websiteUrl"}
          placeholder={"Enter URL"}
          value={value.websiteUrl}
          error={error.websiteUrl}
          onChange={onChange}
        />
        <SelectGroup
          label={"App icon"}
          value={value.logo}
          selectLabel={"Select new image"}
          description={"JPG, PNG or SVG, 32x32"}
          onSelect={onSelect}
        />
        <TextAreaGroup
          label={"Description"}
          name={"description"}
          placeholder={"Enter description"}
          value={value.description}
          error={error.description}
          onChange={onChange}
        />
      </StyledInputBlock>
    </StyledBlock>
  );
};

export default BasicBlock;
