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

import React, { useCallback } from "react";

import BrandingStore from "SRC_DIR/store/portal-settings/BrandingStore";
import CommonStore from "SRC_DIR/store/CommonStore";

export type UseCommonProps = {
  loadBaseInfo: (page: string) => Promise<void>;
  isMobileView: boolean;
  getGreetingSettingsIsDefault: CommonStore["getGreetingSettingsIsDefault"];
  getBrandName: BrandingStore["getBrandName"];
  initWhiteLabel: BrandingStore["initWhiteLabel"];
  setIsLoaded: CommonStore["setIsLoaded"];
  isLoaded: CommonStore["isLoaded"];
};

const useCommon = ({
  loadBaseInfo,
  isMobileView,
  getGreetingSettingsIsDefault,
  getBrandName,
  initWhiteLabel,

  setIsLoaded,
  isLoaded,
}: UseCommonProps) => {
  const inTabBranding = window.location.pathname.includes("branding");
  const inTabGeneral = window.location.pathname.includes("general");

  const getCustomizationData = useCallback(async () => {
    if (isLoaded) return;

    if (isMobileView) {
      loadBaseInfo("language-and-time-zone");
      loadBaseInfo("dns-settings");
      loadBaseInfo("configure-deep-link");
    } else {
      loadBaseInfo("general");
    }
    setIsLoaded(true);

    getGreetingSettingsIsDefault();
  }, [isMobileView, loadBaseInfo, getGreetingSettingsIsDefault]);

  const getBrandingData = useCallback(async () => {
    getBrandName();
    initWhiteLabel();
  }, [getBrandName, initWhiteLabel]);

  const initialLoad = useCallback(async () => {
    // if (!isMobileView) {
    //   await loadBaseInfo(
    //     inTabGeneral
    //       ? "customization"
    //       : inTabBranding
    //         ? "branding"
    //         : "appearance",
    //   );
    // } else {
    //    await loadBaseInfo("customization");
    // }
  }, [loadBaseInfo, inTabGeneral, inTabBranding, isMobileView]);

  const getCommonInitialValue = React.useCallback(async () => {
    const actions = [initialLoad()];
    if (inTabGeneral) actions.push(getCustomizationData());

    if (inTabBranding) actions.push(getBrandingData());

    await Promise.all(actions);
  }, [getCustomizationData, getBrandingData, initialLoad]);

  return {
    getCustomizationData,
    getBrandingData,
    getCommonInitialValue,
  };
};

export default useCommon;
