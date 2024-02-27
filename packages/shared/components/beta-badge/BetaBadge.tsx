import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { InfoBadge } from "@docspace/shared/components/info-badge";
import { Link, LinkTarget } from "@docspace/shared/components/link";
import { DeviceType } from "@docspace/shared/enums";

import type BetaBadgeProps from "./BetaBadge.props";
import { MobileOffset, OtherOffset } from "./BetaBadge.constants";

const BetaBadge = ({
  place,
  forumLink,
  mobilePlace = "bottom-end",
  currentColorScheme,
  documentationEmail,
  currentDeviceType,
  withOutFeedbackLink = false,
}: BetaBadgeProps) => {
  const { t } = useTranslation(["Common,Settings"]);

  const tooltipDescription = (
    <>
      {t("Common:BetaBadgeDescription")}{" "}
      {!withOutFeedbackLink && (
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
                href={forumLink}
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
      )}
    </>
  );

  const isMobile = currentDeviceType === DeviceType.mobile;

  const offset = isMobile ? MobileOffset : OtherOffset;

  return (
    <InfoBadge
      offset={offset}
      place={isMobile ? mobilePlace : place}
      label={t("Common:BetaLabel")}
      tooltipDescription={tooltipDescription}
      tooltipTitle={t("Common:BetaBadgeTitle")}
    />
  );
};

export default BetaBadge;

// export default inject<any>(({ settingsStore }) => {
//   const {
//     forumLink,
//     currentColorScheme,
//     documentationEmail,
//     currentDeviceType,
//   } = settingsStore;

//   return {
//     documentationEmail,
//     currentColorScheme,
//     currentDeviceType,
//     forumLink,
//   };
// })(observer(BetaBadge));
