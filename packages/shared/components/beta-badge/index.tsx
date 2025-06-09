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

import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { InfoBadge } from "../info-badge";
import { Link, LinkTarget } from "../link";
import { DeviceType } from "../../enums";

import { type BetaBadgeProps } from "./BetaBadge.types";
import { MobileOffset, OtherOffset } from "./BetaBadge.constants";

const BetaBadge = ({
  place,
  forumLinkUrl,
  mobilePlace = "bottom-end",
  currentColorScheme,
  documentationEmail,
  currentDeviceType,
  withOutFeedbackLink = false,
  withoutTooltip = false,
}: BetaBadgeProps) => {
  const { t } = useTranslation(["Common", "Settings"]);

  const tooltipDescription = (
    <>
      {t("Common:BetaBadgeDescription", {
        productName: t("Common:ProductName"),
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
                color={currentColorScheme?.main?.accent}
              />
            ),
            3: (
              <Link
                href={`mailto:${documentationEmail}`}
                color={currentColorScheme?.main?.accent}
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
      };

  return (
    <InfoBadge
      offset={offset}
      place={isMobile ? mobilePlace : place}
      label={t("Common:BetaLabel")}
      {...tooltipProps}
    />
  );
};

export { BetaBadge, BetaBadgeProps };
