// (c) Copyright Ascensio System SIA 2009-2024
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

import CombinedShapeSvgUrl from "PUBLIC_DIR/images/combined.shape.svg?url";
import React, { useState, useEffect, useCallback } from "react";
import { withTranslation } from "react-i18next";
import { HelpButton } from "@docspace/shared/components/help-button";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { TextInput } from "@docspace/shared/components/text-input";
import { Button } from "@docspace/shared/components/button";
import { inject, observer } from "mobx-react";

import { useNavigate } from "react-router-dom";
import { isMobile } from "@docspace/shared/utils";
import checkScrollSettingsBlock from "../utils";
import { StyledSettingsComponent, StyledScrollbar } from "./StyledSettings";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import LoaderCustomization from "../sub-components/loaderCustomization";
import withLoading from "SRC_DIR/HOCs/withLoading";
import { Badge } from "@docspace/shared/components/badge";
import { toastr } from "@docspace/shared/components/toast";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { DeviceType } from "@docspace/shared/enums";
import { parseDomain } from "@docspace/shared/utils/common";

const toggleStyle = {
  position: "static",
};

const textInputProps = {
  id: "textInputContainerDNSSettings",
  className: "dns-textarea",
  scale: true,
  tabIndex: 8,
};

const buttonProps = {
  tabIndex: 9,
  className: "save-cancel-buttons send-request-button",
  primary: true,
};
let timerId = null;
const DNSSettings = (props) => {
  const {
    t,
    isMobileView,
    tReady,
    isLoaded,
    setIsLoadedDNSSettings,
    isLoadedPage,
    helpLink,
    initSettings,
    setIsLoaded,
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
  } = props;
  const [hasScroll, setHasScroll] = useState(false);
  const isLoadedSetting = isLoaded && tReady;
  const [isCustomizationView, setIsCustomizationView] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState();
  const [isError, setIsError] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    setDocumentTitle(t("DNSSettings"));

    if (!isLoaded)
      initSettings(isMobileView ? "dns-settings" : "general").then(() =>
        setIsLoaded(true),
      );

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
    if (isLoadedSetting) setIsLoadedDNSSettings(isLoadedSetting);
  }, [isLoadedSetting]);

  const onSendRequest = () => {
    window.open("https://helpdesk.onlyoffice.com/hc/en-us/requests/new");
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
      toastr.success(t("Settings:SuccessfullySaveSettingsMessage"));
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
  const checkInnerWidth = useCallback(() => {
    if (!isMobile()) {
      setIsCustomizationView(true);

      const currentUrl = window.location.href.replace(
        window.location.origin,
        "",
      );

      const newUrl = "/portal-settings/customization/general";

      if (newUrl === currentUrl) return;

      navigate(newUrl);
    } else {
      setIsCustomizationView(false);
    }
  }, [isMobile, setIsCustomizationView]);

  const domainExampleText = " ourcompany.com";

  const settingsBlock = (
    <div className="settings-block">
      {standalone ? (
        <>
          <ToggleButton
            className="settings-dns_toggle-button"
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
            {errorText &&
              errorText.map((err, index) => (
                <Text
                  key={index}
                  fontSize="12px"
                  fontWeight="400"
                  color="#F24724"
                >
                  {err}
                </Text>
              ))}
          </div>
          <div style={{ marginTop: "3px" }}>
            <Text
              key="dns-hint"
              fontSize="12px"
              fontWeight="400"
              color="#A3A9AE"
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
            labelText={`${t("YourCurrentDomain")}`}
            isVertical={true}
          >
            <TextInput
              {...textInputProps}
              isDisabled={true}
              value={location.hostname?.trim()}
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
    <LoaderCustomization dnsSettings={true} />
  ) : (
    <StyledSettingsComponent
      hasScroll={hasScroll}
      className="category-item-wrapper"
      isSettingPaid={isSettingPaid}
      standalone={standalone}
    >
      {isCustomizationView && !isMobileView && (
        <div className="category-item-heading">
          <div className="category-item-title">{t("DNSSettings")}</div>
          {!isSettingPaid && (
            <Badge
              className="paid-badge"
              fontWeight="700"
              backgroundColor="#EDC409"
              label={t("Common:Paid")}
              isPaidBadge={true}
            />
          )}
        </div>
      )}
      <div className="category-item-description">
        <Text fontSize="13px" fontWeight={400}>
          {t("DNSSettingsDescription")}
        </Text>
        <Link
          className="link-learn-more"
          color={currentColorScheme.main?.accent}
          target="_blank"
          isHovered
          href={dnsSettingsUrl}
        >
          {t("Common:LearnMore")}
        </Link>
      </div>
      {settingsBlock}
      <div className="send-request-container">{buttonContainer}</div>
    </StyledSettingsComponent>
  );
};

export default inject(({ settingsStore, common, currentQuotaStore }) => {
  const {
    helpLink,
    currentColorScheme,
    standalone,
    dnsSettingsUrl,
    currentDeviceType,
  } = settingsStore;
  const {
    isLoaded,
    setIsLoadedDNSSettings,
    initSettings,
    setIsLoaded,
    dnsSettings,
    setIsEnableDNS,
    setDNSName,
    saveDNSSettings,
    isDefaultDNS,
  } = common;

  const { isBrandingAndCustomizationAvailable } = currentQuotaStore;
  const { customObj } = dnsSettings;
  const { dnsName, enable } = customObj;

  return {
    isDefaultDNS,
    dnsName: dnsName || "",
    enable,
    setDNSName,
    isLoaded,
    setIsLoadedDNSSettings,
    helpLink,
    initSettings,
    setIsLoaded,
    isSettingPaid: isBrandingAndCustomizationAvailable,
    currentColorScheme,
    standalone,
    setIsEnableDNS,
    saveDNSSettings,
    dnsSettingsUrl,
    currentDeviceType,
  };
})(withLoading(withTranslation(["Settings", "Common"])(observer(DNSSettings))));
