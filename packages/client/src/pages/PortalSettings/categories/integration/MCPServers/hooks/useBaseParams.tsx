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
import { useTranslation } from "react-i18next";

import { FieldContainer } from "@docspace/shared/components/field-container";
import {
  TextInput,
  InputType,
  InputSize,
} from "@docspace/shared/components/text-input";
import { Textarea } from "@docspace/shared/components/textarea";

export const useBaseParams = (initialValues?: {
  name?: string;
  url?: string;
  description?: string;
}) => {
  const { t } = useTranslation(["MCPServers", "Common", "OAuth"]);

  const [name, setName] = React.useState(initialValues?.name || "");
  const [url, setUrl] = React.useState(initialValues?.url || "");
  const [description, setDescription] = React.useState(
    initialValues?.description || "",
  );

  const [nameError, setNameError] = React.useState("");
  const [urlError, setUrlError] = React.useState("");
  const [descriptionError, setDescriptionError] = React.useState("");

  const onChangeName = (value: string) => {
    setName(value);
  };

  const onChangeUrl = (value: string) => {
    setUrl(value);
  };

  const onChangeDescription = (value: string) => {
    setDescription(value);
  };

  const requiredError = t("OAuth:ThisRequiredField");

  const getBaseParams = () => {
    if (!name) {
      setNameError(requiredError);
    }
    if (!url) {
      setUrlError(requiredError);
    }
    if (!description) {
      setDescriptionError(requiredError);
    }

    if (!name || !url || !description) {
      return;
    }

    return {
      name,
      url,
      description,
    };
  };

  const baseParamsComponent = (
    <>
      <FieldContainer
        labelText={t("MCPServers:IntegrationName")}
        isRequired
        isVertical
        removeMargin
        labelVisible
        errorMessage={nameError}
        hasError={!!nameError}
      >
        <TextInput
          type={InputType.text}
          size={InputSize.base}
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder={t("Common:EnterName")}
          scale
          hasError={!!nameError}
        />
      </FieldContainer>
      <FieldContainer
        labelText={t("MCPServers:IntegrationUrl")}
        isRequired
        isVertical
        removeMargin
        labelVisible
        errorMessage={urlError}
        hasError={!!urlError}
      >
        <TextInput
          type={InputType.text}
          size={InputSize.base}
          value={url}
          onChange={(e) => onChangeUrl(e.target.value)}
          placeholder={t("OAuth:EnterURL")}
          scale
          hasError={!!urlError}
        />
      </FieldContainer>
      <FieldContainer
        labelText={t("MCPServers:IntegrationDescription")}
        isRequired
        isVertical
        removeMargin
        labelVisible
        errorMessage={descriptionError}
        hasError={!!descriptionError}
      >
        <Textarea
          heightTextArea={64}
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          placeholder={t("OAuth:EnterDescription")}
        />
      </FieldContainer>
    </>
  );

  return {
    getBaseParams,
    baseParamsComponent,
  };
};
