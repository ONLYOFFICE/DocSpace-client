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

import UploadIcon from "PUBLIC_DIR/images/actions.upload.react.svg";

import React, { useState } from "react";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Button } from "@docspace/shared/components/button";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { Text } from "@docspace/shared/components/text";

import { FileInput } from "@docspace/shared/components/file-input";
import { injectDefaultTheme, mobile } from "@docspace/shared/utils";
import SsoTextInput from "./SsoTextInput";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  .upload-input {
    width: 340px;
    display: flex;
    flex-direction: row;
    gap: 9px;

    @media ${mobile} {
      width: 100%;

      .upload-xml-input {
        max-width: 100%;
      }
    }
  }

  .xml-upload-file {
    width: auto;

    .text-input {
      display: none;
    }

    .icon {
      position: static;
    }

    @media ${mobile} {
      width: 100%;

      button {
        width: 100%;
      }
    }
  }

  .upload-button {
    height: 32px;
    width: 45px;
    overflow: inherit;
  }

  @media ${mobile} {
    flex-direction: column;
    gap: 8px;
  }
`;

const StyledUploadIcon = styled(UploadIcon).attrs(injectDefaultTheme)`
  path {
    stroke: ${(props) =>
      props.disabled
        ? props.theme.client.settings.integration.sso.iconButtonDisabled
        : props.theme.client.settings.integration.sso.iconButton} !important;
  }
`;

const UploadXML = (props) => {
  const { t } = useTranslation(["SingleSignOn", "Common"]);
  const { enableSso, uploadXmlUrl, isLoadingXml, uploadByUrl, uploadXml } =
    props;
  const [isValidXmlUrl, setIsValidXmlUrl] = useState(true);

  const isDisabledProp = {
    disabled:
      !enableSso ||
      uploadXmlUrl.trim().length === 0 ||
      isLoadingXml ||
      !isValidXmlUrl,
  };

  const isValidHttpUrl = (url) => {
    try {
      const newUrl = new URL(url);
      return newUrl.protocol === "http:" || newUrl.protocol === "https:";
    } catch (err) {
      return false;
    }
  };

  const onFocus = () => {
    setIsValidXmlUrl(true);
  };

  const onUploadClick = () => {
    if (isValidHttpUrl(uploadXmlUrl)) {
      setIsValidXmlUrl(true);
      uploadByUrl(t);
    } else {
      setIsValidXmlUrl(false);
    }
  };

  return (
    <FieldContainer
      className="xml-input"
      errorMessage="Error text. Lorem ipsum dolor sit amet, consectetuer adipiscing elit"
      isVertical
      labelText={t("UploadXML")}
    >
      <StyledWrapper>
        <div className="upload-input">
          <SsoTextInput
            className="upload-xml-input"
            maxWidth="297px"
            name="uploadXmlUrl"
            placeholder={t("UploadXMLPlaceholder")}
            tabIndex={1}
            value={uploadXmlUrl}
            hasError={!isValidXmlUrl}
            onFocus={onFocus}
            dataTestId="upload_xml_input"
          />

          <Button
            className="upload-button"
            icon={<StyledUploadIcon {...isDisabledProp} />}
            isDisabled={
              !enableSso ||
              uploadXmlUrl.trim().length === 0 ||
              isLoadingXml ||
              !isValidXmlUrl
            }
            onClick={onUploadClick}
            tabIndex={2}
            testId="upload_xml_button"
          />
        </div>
        <Text className="or-text" noSelect>
          {t("Common:Or")}
        </Text>

        <FileInput
          idButton="select-file"
          accept={[".xml"]}
          buttonLabel={t("Common:SelectFile")}
          className="xml-upload-file"
          isDisabled={!enableSso || isLoadingXml}
          onInput={uploadXml}
          size="middle"
          tabIndex={3}
          data-test-id="upload_xml_file_input"
        />
      </StyledWrapper>
    </FieldContainer>
  );
};

export default inject(({ ssoStore }) => {
  const { enableSso, uploadXmlUrl, isLoadingXml, uploadByUrl, uploadXml } =
    ssoStore;

  return {
    enableSso,
    uploadXmlUrl,
    isLoadingXml,
    uploadByUrl,
    uploadXml,
  };
})(observer(UploadXML));
