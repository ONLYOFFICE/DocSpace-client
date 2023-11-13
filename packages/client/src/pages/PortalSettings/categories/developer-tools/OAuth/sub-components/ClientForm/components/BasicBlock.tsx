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

  isEdit: boolean;
}

const BasicBlock = ({
  t,
  nameValue,
  websiteUrlValue,
  logoValue,
  descriptionValue,
  changeValue,

  isEdit,
}: BasicBlockProps) => {
  const [error, setError] = React.useState({
    name: "",
    websiteUrl: "",
    logo: "",
    description: "",
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;

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

        changeValue("logo", result);
      };
    }
  };

  return (
    <StyledBlock>
      <BlockHeader header={"Basic info"} />
      <StyledInputBlock>
        <InputGroup
          label={t("AppName")}
          name={"name"}
          placeholder={t("Common:EnterName")}
          value={nameValue}
          error={error.name}
          onChange={onChange}
        />
        <InputGroup
          label={t("WebsiteUrl")}
          name={"website_url"}
          placeholder={t("EnterURL")}
          value={websiteUrlValue}
          error={error.websiteUrl}
          onChange={onChange}
          disabled={isEdit}
        />
        <SelectGroup
          label={t("AppIcon")}
          value={logoValue}
          selectLabel={"Select new image"}
          description={t("IconDescription")}
          onSelect={onSelect}
        />
        <TextAreaGroup
          label={t("Common:Description")}
          name={"description"}
          placeholder={t("EnterDescription")}
          value={descriptionValue}
          error={error.description}
          onChange={onChange}
        />
      </StyledInputBlock>
    </StyledBlock>
  );
};

export default BasicBlock;
