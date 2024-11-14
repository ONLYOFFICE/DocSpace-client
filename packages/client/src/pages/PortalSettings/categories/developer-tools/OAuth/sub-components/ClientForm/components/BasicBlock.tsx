import React from "react";
import { Trans } from "react-i18next";
import resizeImage from "resize-image";

import { TTranslation } from "@docspace/shared/types";
import { HelpButton } from "@docspace/shared/components/help-button";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { IClientReqDTO } from "@docspace/shared/utils/oauth/types";
import { toastr } from "@docspace/shared/components/toast";
import { imageProcessing } from "@docspace/shared/utils/common";
import { ONE_MEGABYTE } from "@docspace/shared/constants";

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

    if (file && file.type === "image/svg+xml") {
      if (file.size > ONE_MEGABYTE)
        return toastr.error(t("Common:SizeImageLarge"));

      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === "string")
          changeValue("logo", reader.result);
      };
      reader.readAsDataURL(file);

      return;
    }

    if (file) {
      const widthProp = 64;
      const heightProp = 64;

      const img = new Image();
      img.onload = () => {
        const data = resizeImage.resize(img, widthProp, heightProp, "png");
        changeValue("logo", data);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const pkceHelpButtonText = (
    <Trans t={t} i18nKey="AllowPKCEHelpButton" ns="OAuth" />
  );

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
      </StyledInputBlock>
    </StyledBlock>
  );
};

export default BasicBlock;
