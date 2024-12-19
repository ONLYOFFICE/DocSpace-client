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

"use client";

import React, { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, usePathname } from "next/navigation";

import {
  setAdditionalResources,
  restoreAdditionalResources,
  getAdditionalResources,
} from "@docspace/shared/api/settings";
import { toastr } from "@docspace/shared/components/toast";
import { useResponsiveNavigation } from "@docspace/shared/hooks/useResponsiveSSRNavigation";
import { AdditionalResources } from "@docspace/shared/pages/Branding/AdditionalResources";

import useDeviceType from "@/hooks/useDeviceType";
import { getIsSettingsPaid, getIsCustomizationAvailable } from "@/lib";

export const AdditionalResourcesPage = ({
  portals,
  quota,
  additionalResourcesData,
}) => {
  const { t } = useTranslation("Common");
  const { currentDeviceType } = useDeviceType();
  const router = useRouter();
  const pathname = usePathname();
  const [additionalRes, setAdditionalRes] = useState(additionalResourcesData);
  const [isLoading, startTransition] = useTransition();

  const isCustomizationAvailable = getIsCustomizationAvailable(quota);
  const isSettingPaid = getIsSettingsPaid(portals, isCustomizationAvailable);

  const { feedbackAndSupportEnabled, helpCenterEnabled, isDefault } =
    additionalRes;

  useResponsiveNavigation({
    redirectUrl: "/settings/branding",
    currentLocation: "additional-resources",
    deviceType: currentDeviceType,
    router: router,
    pathname: pathname,
  });

  const onSave = async (feedbackEnabled: boolean, helpEnabled: boolean) => {
    startTransition(async () => {
      try {
        const updatedData = {
          ...additionalRes,
          feedbackAndSupportEnabled: feedbackEnabled,
          helpCenterEnabled: helpEnabled,
        };
        await setAdditionalResources(updatedData);
        const additional = await getAdditionalResources();
        setAdditionalRes(additional);
        toastr.success(t("Settings:SuccessfullySaveSettingsMessage"));
      } catch (error) {
        toastr.error(error);
      }
    });
  };

  const onRestore = async () => {
    startTransition(async () => {
      try {
        await restoreAdditionalResources();
        const additional = await getAdditionalResources();
        setAdditionalRes(additional);
        toastr.success(t("Settings:SuccessfullySaveSettingsMessage"));
      } catch (error) {
        toastr.error(error);
      }
    });
  };

  return (
    <AdditionalResources
      isSettingPaid={isSettingPaid}
      feedbackAndSupportEnabled={feedbackAndSupportEnabled}
      helpCenterEnabled={helpCenterEnabled}
      onSave={onSave}
      onRestore={onRestore}
      isLoading={isLoading}
      additionalResourcesIsDefault={isDefault}
    />
  );
};

