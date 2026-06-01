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

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { withTranslation } from "react-i18next";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { TextInput } from "@docspace/ui-kit/components/text-input";
import { Button } from "@docspace/ui-kit/components/button";
import { inject, observer } from "mobx-react";

import { useNavigate } from "react-router";
import { isMobileDevice } from "@docspace/shared/utils";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import withLoading from "SRC_DIR/HOCs/withLoading";
import { Badge } from "@docspace/ui-kit/components/badge";
import { toastr } from "@docspace/ui-kit/components/toast";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { Text } from "@docspace/ui-kit/components/text";
import { Link } from "@docspace/ui-kit/components/link";
import { DeviceType } from "@docspace/shared/enums";
import { parseDomain } from "@docspace/shared/utils/common";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import LoaderCustomization from "../sub-components/loaderCustomization";
import { StyledSettingsComponent } from "./StyledSettings";
import checkScrollSettingsBlock from "../utils";
import useCommon from "../useCommon";
import { createDefaultHookSettingsProps } from "../../../utils/createDefaultHookSettingsProps";

const toggleStyle = {
  position: "static",
};

const textInputProps = {
  id: "textInputContainerDNSSettings",
  name: "custom_domain",
  testId: "customization_dns_settings_text_input",
  className: "dns-textarea",
  scale: true,
  tabIndex: 8,
};

const buttonProps = {
  tabIndex: 9,
  className: "save-cancel-buttons send-request-button",
  testId: "customization_dns_settings_button",
  primary: true,
};
let timerId = null;
const DNSSettingsComponent = (props) => {
  const {
    t,
    tReady,
    isLoaded,
    setIsLoadedDNSSettings,
    isLoadedPage,
    isSettingPaid,
    currentColorScheme,
    standalone,
    setIsEnableDNS,
    setDNSName,
    saveDNSSettings,
    dnsName,
    enable,
    isDefaultDNS,
    dnsSettingsUrl,
    currentDeviceType,
    requestSupportUrl,
    loadBaseInfo,
    deviceType,
    settingsStore,
    common,
  } = props;

  const [hasScroll, setHasScroll] = useState(false);
  const isLoadedSetting = isLoaded && tReady;
  const [isCustomizationView, setIsCustomizationView] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState();
  const [isError, setIsError] = useState(false);
  const [errorText, setErrorText] = useState("");

  const isMobileView = deviceType === DeviceType.mobile;

  const defaultProps = createDefaultHookSettingsProps({
    loadBaseInfo,
    isMobileView,
    settingsStore,
    common,
  });

  const { getCommonInitialValue } = useCommon(defaultProps.common);

  const theme = useTheme();

  const checkInnerWidth = useCallback(() => {
    if (!isMobileDevice()) {
      setIsCustomizationView(true);

      if (location.pathname.includes("dns-settings")) {
        navigate("/portal-settings/customization/general");
      }
    } else {
      setIsCustomizationView(false);
    }
  }, [isMobileDevice, setIsCustomizationView]);

  useEffect(() => {
    setDocumentTitle(t("DNSSettings"));

    const checkScroll = checkScrollSettingsBlock();
    checkInnerWidth();
    window.addEventListener("resize", checkInnerWidth);

    const scrollPortalName = checkScroll();

    if (scrollPortalName !== hasScroll) {
      setHasScroll(scrollPortalName);
    }

    return () => window.removeEventListener("resize", checkInnerWidth);
  }, []);

  useEffect(() => {
    if (isMobileView) getCommonInitialValue();
  }, [isMobileView]);

  useEffect(() => {
    if (isLoadedSetting) setIsLoadedDNSSettings(isLoadedSetting);
  }, [isLoadedSetting]);

  const onSendRequest = () => {
    window.open(requestSupportUrl);
  };

  const onSaveSettings = async () => {
    try {
      if (!dnsName?.trim()) {
        setIsError(true);
      }

      timerId = setTimeout(() => {
        setIsLoading(true);
      }, [200]);

      await saveDNSSettings();
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (e) {
      setIsError(true);
      toastr.error(e);
    }

    clearTimeout(timerId);
    timerId = null;
    setIsLoading(false);

    setIsError(false);
  };
  const onClickToggle = (e) => {
    const checked = e.currentTarget.checked;
    setIsEnableDNS(checked);
  };

  const onChangeTextInput = (e) => {
    isError && setIsError(false);
    setErrorText("");

    const value = e.target.value.trim();

    const isValidDomain = parseDomain(value || "", setErrorText, t);

    if (!isValidDomain) {
      setIsError(true);
    }
    setDNSName(value);
  };

  const domainExampleText = " ourcompany.com";

  const settingsBlock = (
    <div className="settings-block">
      {standalone ? (
        <>
          <ToggleButton
            className="settings-dns_toggle-button"
            dataTestId="customization_dns_settings_toggle_button"
            label={t("CustomDomainName")}
            onChange={onClickToggle}
            isChecked={enable ?? false}
            style={toggleStyle}
            isDisabled={isLoading}
          />
          <TextInput
            {...textInputProps}
            isDisabled={isLoading || !enable}
            value={dnsName}
            onChange={onChangeTextInput}
            hasError={isError}
          />
          <div style={{ marginTop: "5px" }}>
            {errorText
              ? errorText.map((err) => (
                  <Text
                    className="dns-error-text"
                    key={err}
                    fontSize="12px"
                    fontWeight="400"
                  >
                    {err}
                  </Text>
                ))
              : null}
          </div>
          <div style={{ marginTop: "3px" }}>
            <Text
              key="dns-hint"
              fontSize="12px"
              fontWeight="400"
              color={globalColors.gray}
            >
              {`${t("Settings:DNSSettingsHint")}${domainExampleText}`}
            </Text>
          </div>
        </>
      ) : (
        <>
          <div className="settings-block-description">
            {t("DNSSettingsMobile")}
          </div>
          <FieldContainer
            id="fieldContainerDNSSettings"
            className="field-container-width settings_unavailable"
            labelText={`${t("Common:YourCurrentDomain")}`}
            isVertical
          >
            <TextInput
              {...textInputProps}
              name="current_domain"
              isDisabled
              value={window.location.hostname?.trim()}
            />
          </FieldContainer>
        </>
      )}
    </div>
  );

  const buttonContainer = standalone ? (
    <Button
      {...buttonProps}
      size={currentDeviceType === DeviceType.desktop ? "small" : "normal"}
      label={t("Common:SaveButton")}
      onClick={onSaveSettings}
      isDisabled={isLoading || isDefaultDNS || isError || !dnsName}
      isLoading={isLoading}
    />
  ) : (
    <Button
      {...buttonProps}
      size={currentDeviceType === DeviceType.desktop ? "small" : "normal"}
      label={t("Common:SendRequest")}
      onClick={onSendRequest}
      isDisabled={!isSettingPaid || isError}
    />
  );

  return !isLoadedPage ? (
    <LoaderCustomization dnsSettings />
  ) : (
    <StyledSettingsComponent
      hasScroll={hasScroll}
      className="category-item-wrapper"
      isSettingPaid={isSettingPaid}
      standalone={standalone}
      withoutExternalLink={!dnsSettingsUrl}
    >
      {isCustomizationView && !isMobileView ? (
        <div className="category-item-heading">
          <div className="category-item-title">{t("DNSSettings")}</div>
          {!isSettingPaid && !standalone ? (
            <Badge
              className="paid-badge"
              fontWeight="700"
              backgroundColor={
                theme.isBase
                  ? globalColors.favoritesStatus
                  : globalColors.favoriteStatusDark
              }
              label={t("Common:Paid")}
              isPaidBadge
            />
          ) : null}
        </div>
      ) : null}
      <div className="category-item-description">
        <Text fontSize="13px" fontWeight={400}>
          {t("DNSSettingsDescription")}
        </Text>
        {dnsSettingsUrl ? (
          <Link
            className="link-learn-more"
            color={currentColorScheme.main?.accent}
            dataTestId="customization_dns_settings_learn_more"
            target="_blank"
            isHovered
            href={dnsSettingsUrl}
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </div>
      {settingsBlock}
      <div className="send-request-container">{buttonContainer}</div>
    </StyledSettingsComponent>
  );
};

export const DNSSettings = inject(
  ({ settingsStore, common, currentQuotaStore }) => {
    const {
      currentColorScheme,
      standalone,
      dnsSettingsUrl,
      currentDeviceType,
      requestSupportUrl,
    } = settingsStore;
    const {
      isLoaded,
      setIsLoadedDNSSettings,
      setIsLoaded,
      dnsSettings,
      setIsEnableDNS,
      setDNSName,
      saveDNSSettings,
      isDefaultDNS,
      initSettings,
    } = common;

    const { isCustomizationAvailable } = currentQuotaStore;
    const { customObj } = dnsSettings;
    const { dnsName, enable } = customObj;

    return {
      isDefaultDNS,
      dnsName: dnsName || "",
      enable,
      setDNSName,
      isLoaded,
      setIsLoadedDNSSettings,
      setIsLoaded,
      isSettingPaid: isCustomizationAvailable,
      currentColorScheme,
      standalone,
      setIsEnableDNS,
      saveDNSSettings,
      dnsSettingsUrl,
      currentDeviceType,
      requestSupportUrl,
      loadBaseInfo: async (page) => {
        await initSettings(page);
      },
      settingsStore,
      common,
    };
  },
)(
  withLoading(
    withTranslation(["Settings", "Common"])(observer(DNSSettingsComponent)),
  ),
);
