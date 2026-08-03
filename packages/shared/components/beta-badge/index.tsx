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

import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { buildDataTestId } from "../../utils/common";
import { InfoBadge } from "../info-badge";
import { Link, LinkTarget } from "@docspace/ui-kit/components/link";
import { DeviceType } from "../../enums";

import { type BetaBadgeProps } from "./BetaBadge.types";
import { MobileOffset, OtherOffset } from "./BetaBadge.constants";
import { getBrandName } from "@docspace/shared/constants/brands";
import { getConstName } from "@docspace/shared/constants/consts";

const BetaBadge = ({
  place,
  forumLinkUrl,
  mobilePlace = "bottom-end",
  currentColorScheme,
  documentationEmail,
  currentDeviceType,
  withOutFeedbackLink = false,
  withoutTooltip = false,
  dataTestId,
}: BetaBadgeProps) => {
  const { t } = useTranslation(["Common", "Settings"]);

  const tooltipDescription = (
    <>
      {t("Common:BetaBadgeDescription", {
        productName: getBrandName("ProductName"),
      })}
      {!withOutFeedbackLink ? (
        <Trans
          t={t}
          ns="Common"
          i18nKey="BetaBadgeFeedback"
          values={{
            supportEmail: documentationEmail,
          }}
          components={{
            1: (
              <Link
                href={forumLinkUrl}
                target={LinkTarget.blank}
                color={currentColorScheme?.main?.accent ?? undefined}
                dataTestId={buildDataTestId(dataTestId, "forum_link")}
              />
            ),
            3: (
              <Link
                href={`mailto:${documentationEmail}`}
                color={currentColorScheme?.main?.accent ?? undefined}
                dataTestId={buildDataTestId(
                  dataTestId,
                  "documentation_email_link",
                )}
              />
            ),
          }}
        >
          {`If you have found a bug, please submit it via <1> form </1> or contact us at <3>{{ supportEmail }}</3>`}
        </Trans>
      ) : null}
    </>
  );

  const isMobile = currentDeviceType === DeviceType.mobile;

  const offset = isMobile ? MobileOffset : OtherOffset;

  const tooltipProps = withoutTooltip
    ? {}
    : {
        tooltipTitle: t("Common:BetaBadgeTitle"),
        tooltipDescription,
        dataTestId,
      };

  return (
    <InfoBadge
      offset={offset}
      place={isMobile ? mobilePlace : place}
      label={getConstName("BetaLabel")}
      {...tooltipProps}
    />
  );
};

export { BetaBadge, BetaBadgeProps };
