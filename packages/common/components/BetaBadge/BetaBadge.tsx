import React from "react";
import { inject, observer } from "mobx-react";
import { Trans, useTranslation } from "react-i18next";

import { InfoBadge } from "@docspace/shared/components/info-badge";
import { Link } from "@docspace/shared/components/link";

import type BetaBadgeProps from "./BetaBadge.props";
import { DeviceType } from "../../constants";

const MobileOffset = 4;
const OtherOffset = 10;

function BetaBadge({
  place,
  forumLink,
  mobilePlace = "bottom-end",
  currentColorScheme,
  documentationEmail,
  currentDeviceType,
  withOutFeedbackLink = false,
}: BetaBadgeProps) {
  const { t } = useTranslation(["Common,Settings"]);

  const tooltipDescription = (
    <>
      {t("Common:BetaBadgeDescription")}{" "}
      {!withOutFeedbackLink && (
        <Trans t={t} i18nKey="BetaBadgeFeedback" ns="Common">
          If you have found a bug, please submit it via
          {/*@ts-ignore */}
          <Link
            href={forumLink}
            color={currentColorScheme?.main?.accent}
            target="_blank"
          >
            form
          </Link>
          or contact us at
          {/*@ts-ignore */}
          <Link
            href={`mailto:${documentationEmail}`}
            color={currentColorScheme?.main?.accent}
          >
            {{ supportEmail: documentationEmail }}
          </Link>
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
      label={t("Settings:BetaLabel")}
      tooltipDescription={tooltipDescription}
      tooltipTitle={t("Common:BetaBadgeTitle")}
    />
  );
}

export default inject<any>(({ auth }) => {
  const {
    forumLink,
    currentColorScheme,
    documentationEmail,
    currentDeviceType,
  } = auth.settingsStore;

  return {
    documentationEmail,
    currentColorScheme,
    currentDeviceType,
    forumLink,
  };
})(observer(BetaBadge));
