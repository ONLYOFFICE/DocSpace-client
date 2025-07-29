// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import { TFunction } from "i18next";
import { Trans } from "react-i18next";
import resizeImage from "resize-image";

import { TTranslation } from "@docspace/shared/types";
import { HelpButton } from "@docspace/shared/components/help-button";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { IClientReqDTO } from "@docspace/shared/utils/oauth/types";
import { toastr } from "@docspace/shared/components/toast";
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
    <Trans t={t as TFunction} i18nKey="AllowPKCEHelpButton" ns="OAuth" />
  );

  const isNameRequiredError = requiredErrorFields.includes("name");
  const isWebsiteRequiredError = requiredErrorFields.includes("website_url");
  const isNameError = errorFields.includes("name");
  const isWebsiteError = errorFields.includes("website_url");
  const isLogoRequiredError = requiredErrorFields.includes("logo");

  return (
    <StyledBlock>
      <BlockHeader header={t("BasicInfo")} />
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
          dataTestId="app_name_input_group"
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
          dataTestId="app_website_url_input_group"
        />
        <FieldContainer
          isVertical
          labelVisible={false}
          errorMessage={t("ThisRequiredField")}
          hasError={isLogoRequiredError}
          className="icon-field"
          dataTestId="app_icon_field"
        >
          <SelectGroup
            label={t("AppIcon")}
            value={logoValue}
            selectLabel={t("SelectNewImage")}
            description={t("IconDescription")}
            onSelect={onSelect}
            dataTestId="select_new_image_container"
          />
        </FieldContainer>

        <TextAreaGroup
          label={t("Common:Description")}
          name="description"
          placeholder={t("EnterDescription")}
          value={descriptionValue}
          onChange={onChange}
          increaseHeight={isLogoRequiredError}
          dataTestId="description_textarea_group"
        />
        <InputGroup
          label={t("AuthenticationMethod")}
          name="auth_method"
          placeholder={t("EnterURL")}
          value={websiteUrlValue}
          error=""
          onChange={() => {}}
          dataTestId="auth_method_input_group"
        >
          <div className="pkce">
            <Checkbox
              label={t("AllowPKCE")}
              isChecked={allowPkce}
              onChange={() => {
                changeValue("allow_pkce", !allowPkce);
              }}
              dataTestId="allow_pkce_checkbox"
            />
            <HelpButton
              dataTestId="allow_pkce_help_button"
              tooltipContent={pkceHelpButtonText}
            />
          </div>
        </InputGroup>
      </StyledInputBlock>
    </StyledBlock>
  );
};

export default BasicBlock;
