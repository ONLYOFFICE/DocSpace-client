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
import cloneDeep from "lodash/cloneDeep";

import {
  setWhiteLabelLogos,
  restoreWhiteLabelLogos,
  getLogoUrls,
  getIsDefaultWhiteLabelLogos,
} from "@docspace/shared/api/settings";
import { useResponsiveNavigation } from "@docspace/shared/hooks/useResponsiveSSRNavigation";
import { toastr } from "@docspace/ui-kit/components/toast";
import { WhiteLabel } from "@docspace/shared/pages/Branding/WhiteLabel";
import {
  ILogo,
  IWhiteLabelData,
} from "@docspace/shared/pages/Branding/WhiteLabel/WhiteLabel.types";
import type { TPaymentQuota } from "@docspace/shared/api/portal/types";
import type { TPortals } from "@docspace/shared/api/management/types";

import useDeviceType from "@/hooks/useDeviceType";
import {
  getIsSettingsPaid,
  getIsCustomizationAvailable,
  getIsDefaultWhiteLabel,
} from "@/lib";

import type { TDefaultWhiteLabel } from "@/types";

export const WhiteLabelPage = ({
  whiteLabelLogos,
  showAbout,
  isDefaultWhiteLabel,
  standalone,
  portals,
  quota,
}: {
  whiteLabelLogos: ILogo[];
  showAbout: boolean;
  isDefaultWhiteLabel: boolean;
  standalone: boolean;
  portals?: TPortals[];
  quota?: TPaymentQuota;
}) => {
  const { t } = useTranslation("Common");
  const { currentDeviceType } = useDeviceType();
  const pathname = usePathname();

  const [logoUrls, setLogoUrls] = useState(cloneDeep(whiteLabelLogos));
  const [defaultLogoUrls, setDefaultLogoUrls] = useState(
    cloneDeep(whiteLabelLogos),
  );
  const [isDefault, setIsDefault] = useState(isDefaultWhiteLabel);

  const [isSaving, startTransition] = useTransition();

  const isCustomizationAvailable = getIsCustomizationAvailable(quota);
  const isSettingPaid = getIsSettingsPaid(isCustomizationAvailable, portals);

  useResponsiveNavigation({
    redirectUrl: "/settings/branding",
    currentLocation: "white-label",
    deviceType: currentDeviceType,
    pathname,
  });

  const onSave = async (data: IWhiteLabelData) => {
    startTransition(async () => {
      try {
        await setWhiteLabelLogos(data, true);
        const logos = await getLogoUrls(null, true);
        const isDef = (await getIsDefaultWhiteLabelLogos(
          true,
        )) as TDefaultWhiteLabel;

        setLogoUrls(logos);
        setDefaultLogoUrls(cloneDeep(logos));
        setIsDefault(getIsDefaultWhiteLabel(isDef));
        toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
      } catch (error) {
        toastr.error(error!);
      }
    });
  };

  const onRestoreDefault = async () => {
    try {
      await restoreWhiteLabelLogos(true);
      const logos = await getLogoUrls(null, true);
      const isDef = (await getIsDefaultWhiteLabelLogos(
        true,
      )) as TDefaultWhiteLabel;

      setLogoUrls(logos);
      setDefaultLogoUrls(cloneDeep(logos));
      setIsDefault(getIsDefaultWhiteLabel(isDef));
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (error) {
      toastr.error(error!);
    }
  };

  return (
    <WhiteLabel
      logoUrls={logoUrls}
      isSettingPaid={isSettingPaid}
      showAbout={showAbout}
      standalone={standalone}
      onSave={onSave}
      onRestoreDefault={onRestoreDefault}
      isSaving={isSaving}
      enableRestoreButton={isDefault}
      setLogoUrls={setLogoUrls}
      isWhiteLabelLoaded
      defaultWhiteLabelLogoUrls={defaultLogoUrls}
    />
  );
};
