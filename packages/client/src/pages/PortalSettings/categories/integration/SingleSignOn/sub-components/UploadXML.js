/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import UploadIcon from "PUBLIC_DIR/images/actions.upload.react.svg";

import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Button } from "@docspace/ui-kit/components/button";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { Text } from "@docspace/ui-kit/components/text";

import { FileInput } from "@docspace/ui-kit/components/file-input";
import SsoTextInput from "./SsoTextInput";

import styles from "./UploadXML.module.scss";

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
    } catch {
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
      <div className={styles.styledWrapper}>
        <div className={styles.uploadInput}>
          <SsoTextInput
            className={styles.uploadXmlInput}
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
            className={styles.uploadButton}
            icon={
              <UploadIcon
                className={
                  isDisabledProp.disabled
                    ? styles.uploadIconDisabled
                    : styles.uploadIconEnabled
                }
              />
            }
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
        <Text className="or-text">{t("Common:Or")}</Text>

        <FileInput
          idButton="select-file"
          accept={[".xml"]}
          buttonLabel={t("Common:SelectFile")}
          className={styles.xmlUploadFile}
          isDisabled={!enableSso || isLoadingXml}
          onInput={uploadXml}
          size="middle"
          tabIndex={3}
          data-test-id="upload_xml_file_input"
        />
      </div>
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
