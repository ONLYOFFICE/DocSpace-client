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

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { Button } from "@docspace/ui-kit/components/button";

import { size } from "@docspace/shared/utils";

import styles from "./ProviderMetadata.module.scss";
import { DeviceType } from "@docspace/shared/enums";

import MetadataUrlField from "./sub-components/MetadataUrlField";


const ProviderMetadata = (props) => {
  const { t, ready } = useTranslation("SingleSignOn");
  const navigate = useNavigate();
  const location = useLocation();
  const { downloadMetadata, currentDeviceType, isSSOAvailable } = props;

  const isMobileView = currentDeviceType === DeviceType.mobile;
  const url = window.location.origin;

  const checkWidth = () => {
    window.innerWidth > size.mobile &&
      location.pathname.includes("metadata") &&
      navigate("/portal-settings/integration/sso");
  };

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  if (!ready) return null;

  return (
    <div className={styles.styledWrapper}>
      <MetadataUrlField
        labelText={t("SPEntityId")}
        name="spEntityId"
        placeholder={`${url}/sso/metadata`}
        tooltipContent={<Text fontSize="12px">{t("SPEntityIdTooltip")}</Text>}
        tooltipClass="sp-entity-id-tooltip icon-button"
        dataTestId="sp_entity_id"
      />

      <MetadataUrlField
        labelText={t("SPAssertionConsumerURL")}
        name="spAssertionConsumerUrl"
        placeholder={`${url}/sso/acs`}
        tooltipContent={
          <Text fontSize="12px">{t("SPAssertionConsumerURLTooltip")}</Text>
        }
        tooltipClass="sp-assertion-consumer-url-tooltip icon-button"
        dataTestId="sp_assertion_consumer_url"
      />

      <MetadataUrlField
        labelText={t("SPSingleLogoutURL")}
        name="spSingleLogoutUrl"
        placeholder={`${url}/sso/slo/callback`}
        tooltipContent={
          <Text fontSize="12px">{t("SPSingleLogoutURLTooltip")}</Text>
        }
        tooltipClass="sp-single-logout-url-tooltip icon-button"
        dataTestId="sp_single_logout_url"
      />

      <div className={styles.buttonWrapper}>
        <Button
          id="download-metadata-xml"
          label={t("DownloadMetadataXML")}
          primary
          scale={isMobileView}
          size={isMobileView ? "normal" : "small"}
          tabIndex={25}
          onClick={downloadMetadata}
          isDisabled={!isSSOAvailable}
          testId="download_metadata_xml_button"
        />
      </div>
    </div>
  );
};

export const ProviderMetadataSection = inject(
  ({ ssoStore, settingsStore, currentQuotaStore }) => {
    const { downloadMetadata } = ssoStore;
    const { currentDeviceType } = settingsStore;
    const { isSSOAvailable } = currentQuotaStore;

    return {
      downloadMetadata,
      currentDeviceType,
      isSSOAvailable,
    };
  },
)(observer(ProviderMetadata));
