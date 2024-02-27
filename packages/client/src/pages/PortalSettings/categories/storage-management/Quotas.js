import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { Trans } from "react-i18next";

import { isMobile } from "@docspace/shared/utils";
import { Text } from "@docspace/shared/components/text";
import { Badge } from "@docspace/shared/components/badge";
import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";

import { StyledBaseQuotaComponent, StyledMainTitle } from "./StyledComponent";
import QuotaPerRoomComponent from "./sub-components/QuotaPerRoom";
import QuotaPerUserComponent from "./sub-components/QuotaPerUser";
import MobileQuotasComponent from "./sub-components/MobileQuotas";

const helpLink =
  "https://helpcenter.onlyoffice.com/administration/docspace-settings.aspx#StorageManagement_block";

const QuotaPerItemsComponent = ({ isStatisticsAvailable }) => {
  if (isMobile())
    return <MobileQuotasComponent isDisabled={!isStatisticsAvailable} />;

  return (
    <>
      <QuotaPerRoomComponent isDisabled={!isStatisticsAvailable} />
      <QuotaPerUserComponent />
    </>
  );
};
const QuotasComponent = (props) => {
  const { t } = useTranslation("Settings");

  const { isStatisticsAvailable } = props;

  return (
    <StyledBaseQuotaComponent>
      <div className="title-container">
        <StyledMainTitle fontSize="16px" fontWeight={700}>
          {t("Quotas")}
        </StyledMainTitle>

        {!isStatisticsAvailable && (
          <Badge
            backgroundColor="#EDC409"
            label={t("Common:Paid")}
            className="paid-badge"
            isPaidBadge
          />
        )}
      </div>
      <Text className="quotas_description">
        <Trans t={t} i18nKey="QuotasDescription" ns="Settings">
          Here, you can set storage quota for users and rooms.
          <ColorTheme
            themeId={ThemeId.Link}
            tag="a"
            isHovered={false}
            target="_blank"
            href={helpLink}
          >
            Help Center
          </ColorTheme>
        </Trans>
      </Text>

      <QuotaPerItemsComponent isStatisticsAvailable={isStatisticsAvailable} />
    </StyledBaseQuotaComponent>
  );
};

export default inject(({ currentQuotaStore }) => {
  const { isStatisticsAvailable } = currentQuotaStore;

  return {
    isStatisticsAvailable,
  };
})(observer(QuotasComponent));
