import React from "react";
import { inject, observer } from "mobx-react";
import { Trans, useTranslation } from "react-i18next";

import InfoBadge from "@docspace/components/info-badge";
import Link from "@docspace/components/link";

import type BetaBadgeProps from "./BetaBadge.props";
import { DeviceType } from "../../constants";

const MobileOffset = 4;
const OtherOffset = 10;

function BetaBadge({
  place,
  mobilePlace = "bottom-end",
  currentColorScheme,
  documentationEmail,
  currentDeviceType,
}: BetaBadgeProps) {
  const { t } = useTranslation(["Common,Settings"]);

  const tooltipLanguage = (
    <Trans t={t} i18nKey="BetaBadgeDescription" ns="Common">
      Please note: you can enable RTL languages for the DocSpace interface in
      the beta mode. RTL support for the editors will be available soon. If you
      have found a bug, please submit it via
      {/*@ts-ignore */}
      <Link
        href={`mailto:${documentationEmail}`}
        color={currentColorScheme?.main?.accent}
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
  );

  const isMobile = currentDeviceType === DeviceType.mobile;

  const offset = isMobile ? MobileOffset : OtherOffset;

  return (
    <InfoBadge
      offset={offset}
      place={isMobile ? mobilePlace : place}
      label={t("Settings:BetaLabel")}
      tooltipDescription={tooltipLanguage}
      tooltipTitle={t("Common:BetaBadgeTitle")}
    />
  );
}

export default inject<any>(({ auth }) => {
  const {
    helpLink,
    currentColorScheme,
    documentationEmail,
    currentDeviceType,
  } = auth.settingsStore;

  return { documentationEmail, currentColorScheme, currentDeviceType };
})(observer(BetaBadge));
