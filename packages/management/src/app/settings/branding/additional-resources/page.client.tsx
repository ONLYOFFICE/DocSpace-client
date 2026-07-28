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

"use client";

import React, { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";

import {
  setAdditionalResources,
  restoreAdditionalResources,
  getAdditionalResources,
} from "@docspace/shared/api/settings";
import { toastr } from "@docspace/ui-kit/components/toast";
import { useResponsiveNavigation } from "@docspace/shared/hooks/useResponsiveSSRNavigation";
import { AdditionalResources } from "@docspace/shared/pages/Branding/AdditionalResources";
import type { TAdditionalResources } from "@docspace/shared/api/settings/types";
import type { TPaymentQuota } from "@docspace/shared/api/portal/types";
import type { TPortals } from "@docspace/shared/api/management/types";

import useDeviceType from "@/hooks/useDeviceType";
import { getIsSettingsPaid, getIsCustomizationAvailable } from "@/lib";

export const AdditionalResourcesPage = ({
  portals,
  quota,
  additionalResourcesData,
}: {
  portals?: TPortals[];
  quota?: TPaymentQuota;
  additionalResourcesData: TAdditionalResources;
}) => {
  const { t } = useTranslation("Common");
  const { currentDeviceType } = useDeviceType();
  const pathname = usePathname();
  const [additionalRes, setAdditionalRes] = useState(additionalResourcesData);
  const [isLoading, startTransition] = useTransition();

  const isCustomizationAvailable = getIsCustomizationAvailable(quota);
  const isSettingPaid = getIsSettingsPaid(isCustomizationAvailable, portals);

  const { feedbackAndSupportEnabled, helpCenterEnabled, isDefault } =
    additionalRes;

  useResponsiveNavigation({
    redirectUrl: "/settings/branding",
    currentLocation: "additional-resources",
    deviceType: currentDeviceType,
    pathname,
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
        toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
      } catch (error) {
        toastr.error(error!);
      }
    });
  };

  const onRestore = async () => {
    startTransition(async () => {
      try {
        await restoreAdditionalResources();
        const additional = await getAdditionalResources();
        setAdditionalRes(additional);
        toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
      } catch (error) {
        toastr.error(error!);
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
