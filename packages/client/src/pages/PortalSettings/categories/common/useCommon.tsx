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

import React, { useCallback, useMemo } from "react";

import BrandingStore from "SRC_DIR/store/portal-settings/BrandingStore";
import CommonStore from "SRC_DIR/store/CommonStore";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { mapCulturesToArray } from "@docspace/shared/utils/common";
import i18n from "SRC_DIR/i18n";

export type UseCommonProps = {
  loadBaseInfo?: (page: string) => Promise<void>;
  isMobileView?: boolean;
  getGreetingSettingsIsDefault?: CommonStore["getGreetingSettingsIsDefault"];
  getBrandName?: BrandingStore["getBrandName"];
  initWhiteLabel?: BrandingStore["initWhiteLabel"];
  setIsLoaded?: CommonStore["setIsLoaded"];
  isLoaded?: CommonStore["isLoaded"];

  cultures?: SettingsStore["cultures"];
};

const useCommon = ({
  loadBaseInfo,
  isMobileView,
  getGreetingSettingsIsDefault,
  getBrandName,
  initWhiteLabel,

  setIsLoaded,
  isLoaded,

  cultures,
}: UseCommonProps) => {
  const getCustomizationData = useCallback(
    async (
      page?:
        | "language-and-time-zone"
        | "dns-settings"
        | "configure-deep-link"
        | "welcome-page-settings",
    ) => {
      if (isLoaded) return;

      if (isMobileView && page) {
        await loadBaseInfo?.(page);
        if (page === "welcome-page-settings") {
          await getGreetingSettingsIsDefault?.();
        }
      } else if (!isMobileView && !page) {
        await Promise.all([
          loadBaseInfo?.("general"),
          getGreetingSettingsIsDefault?.(),
        ]);
      }
      setIsLoaded?.(true);
    },
    [
      isMobileView,
      loadBaseInfo,
      getGreetingSettingsIsDefault,
      setIsLoaded,
      isLoaded,
    ],
  );

  const getBrandingData = useCallback(async () => {
    await Promise.all([getBrandName?.(), initWhiteLabel?.()]);
  }, [getBrandName, initWhiteLabel]);

  const cultureNames = useMemo(
    () => (cultures ? mapCulturesToArray(cultures, true, i18n) : []),
    [cultures],
  );

  const getCommonInitialValue = React.useCallback(async () => {
    const actions = [];
    if (window.location.pathname.includes("language-and-time-zone"))
      actions.push(getCustomizationData("language-and-time-zone"));

    if (window.location.pathname.includes("welcome-page-settings"))
      actions.push(getCustomizationData("welcome-page-settings"));

    if (window.location.pathname.includes("configure-deep-link"))
      actions.push(getCustomizationData("configure-deep-link"));

    if (window.location.pathname.includes("dns-settings"))
      actions.push(getCustomizationData("dns-settings"));

    if (window.location.pathname.includes("brand-name"))
      actions.push(getBrandName?.());

    if (window.location.pathname.includes("white-label"))
      actions.push(initWhiteLabel?.());

    if (!isMobileView && window.location.pathname.includes("general"))
      actions.push(getCustomizationData());

    if (!isMobileView && window.location.pathname.includes("branding"))
      actions.push(getBrandingData());

    await Promise.all(actions);
  }, [getCustomizationData, getBrandingData, getBrandName, initWhiteLabel]);

  return {
    getCustomizationData,
    getBrandingData,
    getCommonInitialValue,
    cultureNames,
  };
};

export default useCommon;
