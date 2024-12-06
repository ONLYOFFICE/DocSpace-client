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

import React from "react";
import { useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import isEqual from "lodash/isEqual";

import { WhiteLabel as WhiteLabelPage } from "@docspace/shared/pages/Branding/WhiteLabel";
import { toastr } from "@docspace/shared/components/toast";
import { isManagement } from "@docspace/shared/utils/common";
import { globalColors } from "@docspace/shared/themes";

import LoaderWhiteLabel from "../sub-components/loaderWhiteLabel";
import {
  generateLogo,
  getLogoOptions,
  uploadLogo,
} from "../../../utils/whiteLabelHelper";

const WhiteLabelComponent = (props) => {
  const {
    t,
    isSettingPaid,
    deviceType,
    standalone,
    displayAbout,
    showNotAvailable,
    defaultWhiteLabelLogoUrls,
    logoUrls,
    logoText,
    defaultLogoText,
    isDefaultWhiteLabel,
    isWhiteLabelLoaded,
    initWhiteLabel,
    setLogoUrls,
    setLogoText,
    saveWhiteLabelSettings,
    resetWhiteLabelSettings,
  } = props;
  const [logoTextWhiteLabel, setLogoTextWhiteLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEmpty, setIsEmpty] = useState(isWhiteLabelLoaded && !logoText);

  const showAbout = standalone && isManagement() && displayAbout;

  useEffect(() => {
    initWhiteLabel();
  }, []);

  useEffect(() => {
    if (!isWhiteLabelLoaded) return;
    setIsEmpty(!logoText);
    if (!logoText) return;
    setLogoTextWhiteLabel(logoText);
  }, [logoText, isWhiteLabelLoaded]);

  const onChangeCompanyName = (e) => {
    const value = e.target.value;
    setLogoTextWhiteLabel(value);
    const trimmedValue = value?.trim();
    setIsEmpty(!trimmedValue);
  };

  const onUseTextAsLogo = () => {
    if (isEmpty) return;

    let newLogos = logoUrls;

    for (let i = 0; i < logoUrls.length; i++) {
      const options = getLogoOptions(
        i,
        logoTextWhiteLabel,
        logoUrls[i].size.width,
        logoUrls[i].size.height,
      );

      if (!showAbout && logoUrls[i].name === "AboutPage") continue;

      const isDocsEditorName = logoUrls[i].name === "DocsEditor";

      const logoLight = generateLogo(
        options.width,
        options.height,
        options.text,
        options.fontSize,
        isDocsEditorName ? globalColors.white : globalColors.darkBlack,
        options.alignCenter,
        options.isEditor,
      );
      const logoDark = generateLogo(
        options.width,
        options.height,
        options.text,
        options.fontSize,
        globalColors.white,
        options.alignCenter,
        options.isEditor,
      );
      newLogos[i].path.light = logoLight;
      newLogos[i].path.dark = logoDark;
    }

    setLogoUrls(newLogos);
  };

  const onRestoreDefault = async () => {
    try {
      await resetWhiteLabelSettings();
      toastr.success(t("Settings:SuccessfullySaveSettingsMessage"));
    } catch (error) {
      toastr.error(error);
    }
  };

  const onChangeLogo = async (e) => {
    const id = e.target.id.split("_");
    const type = id[1];
    const theme = id[2];

    let file = e.target.files[0];

    const { data } = await uploadLogo(file, type);

    if (data.Success) {
      const url = data.Message;
      const newArr = logoUrls;

      if (theme === "light") {
        newArr[type - 1].path.light = url;
      } else if (theme === "dark") {
        newArr[type - 1].path.dark = url;
      }

      setLogoUrls(newArr);
    } else {
      console.error(data.Message);
      toastr.error(data.Message);
    }
  };

  const onSave = async () => {
    let logosArr = [];

    for (let i = 0; i < logoUrls.length; i++) {
      const currentLogo = logoUrls[i];
      const defaultLogo = defaultWhiteLabelLogoUrls[i];

      if (!isEqual(currentLogo, defaultLogo)) {
        let value = {};

        if (!isEqual(currentLogo.path.light, defaultLogo.path.light))
          value.light = currentLogo.path.light;
        if (!isEqual(currentLogo.path.dark, defaultLogo.path.dark))
          value.dark = currentLogo.path.dark;

        logosArr.push({
          key: String(i + 1),
          value: value,
        });
      }
    }
    const data = {
      logoText: logoTextWhiteLabel,
      logo: logosArr,
    };

    try {
      setIsSaving(true);
      await saveWhiteLabelSettings(data);
      setLogoText(data.logoText);
      toastr.success(t("Settings:SuccessfullySaveSettingsMessage"));
    } catch (error) {
      toastr.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const isEqualLogo = isEqual(logoUrls, defaultWhiteLabelLogoUrls);
  const isEqualText = defaultLogoText === logoTextWhiteLabel;
  const saveButtonDisabled = isEqualLogo && isEqualText;

  return !isWhiteLabelLoaded ? (
    <LoaderWhiteLabel />
  ) : (
    <WhiteLabelPage
      t={t}
      logoUrls={logoUrls}
      onChangeLogo={onChangeLogo}
      isSettingPaid={isSettingPaid}
      showAbout={showAbout}
      showNotAvailable={showNotAvailable}
      standalone={standalone}
      onUseTextAsLogo={onUseTextAsLogo}
      isEmpty={isEmpty}
      logoTextWhiteLabel={logoTextWhiteLabel}
      onChangeCompanyName={onChangeCompanyName}
      onSave={onSave}
      onRestoreDefault={onRestoreDefault}
      saveButtonDisabled={saveButtonDisabled}
      isSaving={isSaving}
      enableRestoreButton={isDefaultWhiteLabel}
      deviceType={deviceType}
    />
  );
};

export const WhiteLabel = inject(
  ({ settingsStore, currentQuotaStore, brandingStore }) => {
    const {
      logoUrls,
      logoText,
      defaultLogoText,
      isDefaultWhiteLabel,
      isWhiteLabelLoaded,
      initWhiteLabel,
      setLogoUrls,
      setLogoText,
      saveWhiteLabelSettings,
      resetWhiteLabelSettings,
    } = brandingStore;
    const {
      whiteLabelLogoUrls: defaultWhiteLabelLogoUrls,
      deviceType,
      checkEnablePortalSettings,
      standalone,
      displayAbout,
    } = settingsStore;
    const { isCustomizationAvailable } = currentQuotaStore;

    const isSettingPaid = checkEnablePortalSettings(isCustomizationAvailable);
    const showNotAvailable = isManagement()
      ? !isCustomizationAvailable
      : !isSettingPaid && standalone;
    return {
      theme: settingsStore.theme,
      isSettingPaid,
      deviceType,
      standalone,
      displayAbout,
      showNotAvailable,
      defaultWhiteLabelLogoUrls,
      logoUrls,
      logoText,
      defaultLogoText,
      isDefaultWhiteLabel,
      isWhiteLabelLoaded,
      initWhiteLabel,
      setLogoUrls,
      setLogoText,
      saveWhiteLabelSettings,
      resetWhiteLabelSettings,
    };
  },
)(
  withTranslation(["Settings", "Profile", "Common"])(
    observer(WhiteLabelComponent),
  ),
);
