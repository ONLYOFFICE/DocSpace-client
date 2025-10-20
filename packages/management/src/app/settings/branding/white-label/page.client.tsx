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
import { usePathname } from "next/navigation";
import cloneDeep from "lodash/cloneDeep";

import {
  setWhiteLabelLogos,
  restoreWhiteLabelLogos,
  getLogoUrls,
  getIsDefaultWhiteLabelLogos,
} from "@docspace/shared/api/settings";
import { useResponsiveNavigation } from "@docspace/shared/hooks/useResponsiveSSRNavigation";
import { toastr } from "@docspace/shared/components/toast";
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
      showNotAvailable={!isCustomizationAvailable}
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
