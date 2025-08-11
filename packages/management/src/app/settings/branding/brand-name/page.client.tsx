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

"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/shared/components/toast";

import { BrandName } from "@docspace/shared/pages/Branding/BrandName";
import { IWhiteLabelData } from "@docspace/shared/pages/Branding/WhiteLabel/WhiteLabel.types";
import type { TPaymentQuota } from "@docspace/shared/api/portal/types";

import { setBrandName } from "@docspace/shared/api/settings";
import { useResponsiveNavigation } from "@docspace/shared/hooks/useResponsiveSSRNavigation";

import useDeviceType from "@/hooks/useDeviceType";
import { getIsCustomizationAvailable } from "@/lib";

export const BrandNamePage = ({
  isSettingPaid,
  standalone,
  brandName,
  quota,
}: {
  isSettingPaid: boolean;
  standalone: boolean;
  brandName: string;
  quota?: TPaymentQuota;
}) => {
  const { t } = useTranslation("Common");
  const router = useRouter();
  const pathname = usePathname();
  const { currentDeviceType } = useDeviceType();

  const isCustomizationAvailable = getIsCustomizationAvailable(quota);

  useResponsiveNavigation({
    redirectUrl: "/settings/branding",
    currentLocation: "brand-name",
    deviceType: currentDeviceType,
    pathname,
  });

  const onSave = async (data: IWhiteLabelData) => {
    try {
      await setBrandName(data, true);
      router.refresh();
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (error) {
      toastr.error(error!);
    }
  };

  return (
    <BrandName
      showNotAvailable={!isCustomizationAvailable}
      isSettingPaid={isSettingPaid}
      standalone={standalone}
      onSave={onSave}
      isBrandNameLoaded
      defaultBrandName={brandName}
      brandName={brandName}
    />
  );
};
