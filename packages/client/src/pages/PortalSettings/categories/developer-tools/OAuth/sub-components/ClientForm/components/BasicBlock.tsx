import React from "react";

import ComboBox from "@docspace/components/combobox";
import { AuthenticationMethod } from "@docspace/common/utils/oauth/enums";

import { StyledBlock, StyledInputBlock } from "../ClientForm.styled";

import BlockHeader from "./BlockHeader";
import InputGroup from "./InputGroup";
import TextAreaGroup from "./TextAreaGroup";
import SelectGroup from "./SelectGroup";
import Checkbox from "@docspace/components/checkbox";

interface BasicBlockProps {
  t: any;

  nameValue: string;
  websiteUrlValue: string;
  logoValue: string;
  descriptionValue: string;
  allowPkce: boolean;

  changeValue: (name: string, value: string | boolean) => void;

  isEdit: boolean;
  errorFields: string[];
}

function getImageDimensions(
  image: any
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    image.onload = function (e: any) {
      const width = this.width;
      const height = this.height;
      resolve({ height, width });
    };
  });
}

function compressImage(
  image: HTMLImageElement,
  scale: number,
  initalWidth: number,
  initalHeight: number
): any {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");

    canvas.width = scale * initalWidth;
    canvas.height = scale * initalHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      ctx.canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/png");
    }
  });
}

const BasicBlock = ({
  t,
  nameValue,
  websiteUrlValue,
  logoValue,
  descriptionValue,
  allowPkce,
  changeValue,

  isEdit,
  errorFields,
}: BasicBlockProps) => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;

    changeValue(target.name, target.value);
  };

  const onSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file =
      e.target.files && e.target.files?.length > 0 && e.target.files[0];

    if (file) {
      const imgEl = document.getElementsByClassName(
        "client-logo"
      )[0] as HTMLImageElement;

      imgEl.src = URL.createObjectURL(file);

      const { height, width } = await getImageDimensions(imgEl);

      const MAX_WIDTH = 32; //if we resize by width, this is the max width of compressed image
      const MAX_HEIGHT = 32; //if we resize by height, this is the max height of the compressed image

      const widthRatioBlob = await compressImage(
        imgEl,
        MAX_WIDTH / width,
        width,
        height
      );
      const heightRatioBlob = await compressImage(
        imgEl,
        MAX_HEIGHT / height,
        width,
        height
      );

      //pick the smaller blob between both
      const compressedBlob =
        widthRatioBlob.size > heightRatioBlob.size
          ? heightRatioBlob
          : widthRatioBlob;

      const reader = new FileReader();
      reader.readAsDataURL(compressedBlob);

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
          error={`${t("ErrorName")} 3`}
          onChange={onChange}
          isRequired
          isError={errorFields.includes("name")}
        />
        <InputGroup
          label={t("WebsiteUrl")}
          name={"website_url"}
          placeholder={t("EnterURL")}
          value={websiteUrlValue}
          error={`${t("ErrorWrongURL")}`}
          onChange={onChange}
          disabled={isEdit}
          isRequired
          isError={errorFields.includes("website_url")}
        />
        <SelectGroup
          label={t("AppIcon")}
          value={logoValue}
          selectLabel={t("SelectNewImage")}
          description={t("IconDescription")}
          onSelect={onSelect}
        />
        <TextAreaGroup
          label={t("Common:Description")}
          name={"description"}
          placeholder={t("EnterDescription")}
          value={descriptionValue}
          onChange={onChange}
        />
        <Checkbox
          label={"Allow pkce"}
          isChecked={allowPkce}
          onChange={() => {
            changeValue("allow_pkce", !allowPkce);
          }}
        />
      </StyledInputBlock>
    </StyledBlock>
  );
};

export default BasicBlock;
