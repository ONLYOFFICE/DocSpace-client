import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import MobileCategoryWrapper from "../../../components/MobileCategoryWrapper";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const MobileView = ({ isSettingPaid }) => {
  const { t } = useTranslation(["Settings"]);
  const navigate = useNavigate();

  const onClickLink = (e) => {
    e.preventDefault();
    navigate(e.target.pathname);
  };

  return (
    <StyledWrapper>
      <MobileCategoryWrapper
        title={t("WhiteLabel")}
        subtitle={t("BrandingSubtitle")}
        url="/portal-settings/customization/branding/white-label"
        withPaidBadge={!isSettingPaid}
        badgeLabel={t("Common:Paid")}
        onClickLink={onClickLink}
      />
      <MobileCategoryWrapper
        title={t("CompanyInfoSettings")}
        subtitle={t("BrandingSectionDescription")}
        url="/portal-settings/customization/branding/company-info-settings"
        withPaidBadge={!isSettingPaid}
        badgeLabel={t("Common:Paid")}
        onClickLink={onClickLink}
      />
      <MobileCategoryWrapper
        title={t("AdditionalResources")}
        subtitle={t("AdditionalResourcesSubtitle")}
        url="/portal-settings/customization/branding/additional-resources"
        withPaidBadge={!isSettingPaid}
        badgeLabel={t("Common:Paid")}
        onClickLink={onClickLink}
      />
    </StyledWrapper>
  );
};

export default MobileView;
