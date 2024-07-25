import React from "react";
import { Trans } from "react-i18next";

import { TTranslation } from "@docspace/shared/types";
import { HelpButton } from "@docspace/shared/components/help-button";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { IClientReqDTO } from "@docspace/shared/utils/oauth/types";
// import { ToggleButton } from "@docspace/shared/components/toggle-button";
// import { Text } from "@docspace/shared/components/text";

import { StyledBlock, StyledInputBlock } from "../ClientForm.styled";

import BlockHeader from "./BlockHeader";
import InputGroup from "./InputGroup";
import TextAreaGroup from "./TextAreaGroup";
import SelectGroup from "./SelectGroup";

interface BasicBlockProps {
  t: TTranslation;

  nameValue: string;
  websiteUrlValue: string;
  logoValue: string;
  descriptionValue: string;
  allowPkce: boolean;
  // isPublic: boolean;

  changeValue: (
    name: keyof IClientReqDTO,
    value: string | boolean,
    remove?: boolean,
  ) => void;

  isEdit: boolean;
  errorFields: string[];
  requiredErrorFields: string[];
  onBlur: (name: string) => void;
}

function getImageDimensions(
  image: HTMLImageElement,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    image.onload = () => {
      const width = image.width;
      const height = image.height;
      resolve({ height, width });
    };
  });
}

function compressImage(
  image: HTMLImageElement,
  scale: number,
  initialWidth: number,
  initialHeight: number,
): Promise<Blob | undefined | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");

    canvas.width = scale * initialWidth;
    canvas.height = scale * initialHeight;

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
  // isPublic,
  changeValue,

  isEdit,
  errorFields,
  requiredErrorFields,
  onBlur,
}: BasicBlockProps) => {
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const target = e.target;

    changeValue(target.name as keyof IClientReqDTO, target.value);
  };

  const onSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file =
      e.target.files && e.target.files?.length > 0 && e.target.files[0];

    if (file) {
      const imgEl = document.getElementsByClassName(
        "client-logo",
      )[0] as HTMLImageElement;

      imgEl.src = URL.createObjectURL(file);

      const { height, width } = await getImageDimensions(imgEl);

      const MAX_WIDTH = 32; // if we resize by width, this is the max width of compressed image
      const MAX_HEIGHT = 32; // if we resize by height, this is the max height of the compressed image

      const widthRatioBlob = await compressImage(
        imgEl,
        MAX_WIDTH / width,
        width,
        height,
      );
      const heightRatioBlob = await compressImage(
        imgEl,
        MAX_HEIGHT / height,
        width,
        height,
      );

      if (widthRatioBlob && heightRatioBlob) {
        // pick the smaller blob between both
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
    }
  };

  const pkceHelpButtonText = (
    <Trans t={t} i18nKey="AllowPKCEHelpButton" ns="OAuth" />
  );

  // const publicClientHelpButtonText = "Help text";

  const isNameRequiredError = requiredErrorFields.includes("name");
  const isWebsiteRequiredError = requiredErrorFields.includes("website_url");
  const isNameError = errorFields.includes("name");
  const isWebsiteError = errorFields.includes("website_url");
  const isLogoRequiredError = requiredErrorFields.includes("logo");

  return (
    <StyledBlock>
      <BlockHeader header="Basic info" />
      <StyledInputBlock>
        <InputGroup
          label={t("AppName")}
          name="name"
          placeholder={t("Common:EnterName")}
          value={nameValue}
          error={isNameError ? `${t("ErrorName")} 3` : t("ThisRequiredField")}
          onChange={onChange}
          isRequired
          isError={isNameRequiredError || isNameError}
          onBlur={onBlur}
        />
        <InputGroup
          label={t("WebsiteUrl")}
          name="website_url"
          placeholder={t("EnterURL")}
          value={websiteUrlValue}
          error={
            isWebsiteError
              ? `${t("ErrorWrongURL")}: ${window.location.origin}`
              : t("ThisRequiredField")
          }
          onChange={onChange}
          disabled={isEdit}
          isRequired
          isError={isWebsiteRequiredError || isWebsiteError}
          onBlur={onBlur}
        />
        <FieldContainer
          isVertical
          labelVisible={false}
          errorMessage={t("ThisRequiredField")}
          hasError={isLogoRequiredError}
          className="icon-field"
        >
          <SelectGroup
            label={t("AppIcon")}
            value={logoValue}
            selectLabel={t("SelectNewImage")}
            description={t("IconDescription")}
            onSelect={onSelect}
          />
        </FieldContainer>

        <TextAreaGroup
          label={t("Common:Description")}
          name="description"
          placeholder={t("EnterDescription")}
          value={descriptionValue}
          onChange={onChange}
          increaseHeight={isLogoRequiredError}
        />
        <InputGroup
          label={t("AuthenticationMethod")}
          name="auth_method"
          placeholder={t("EnterURL")}
          value={websiteUrlValue}
          error=""
          onChange={() => {}}
        >
          <div className="pkce">
            <Checkbox
              label={t("AllowPKCE")}
              isChecked={allowPkce}
              onChange={() => {
                changeValue("allow_pkce", !allowPkce);
              }}
            />
            <HelpButton tooltipContent={pkceHelpButtonText} />
          </div>
        </InputGroup>
        {/* <InputGroup
          label="Client type"
          name="public_client"
          placeholder={t("EnterURL")}
          value=""
          error=""
          onChange={() => {}}
        >
          <div className="public_client">
            <ToggleButton
              isChecked={isPublic}
              onChange={(e) => {
                changeValue("is_public", e.target.checked);
              }}
            />
            <Text>Public client</Text>
            <HelpButton tooltipContent={publicClientHelpButtonText} />
          </div>
        </InputGroup> */}
      </StyledInputBlock>
    </StyledBlock>
  );
};

export default BasicBlock;
