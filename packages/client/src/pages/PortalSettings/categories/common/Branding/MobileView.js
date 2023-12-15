import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import MobileCategoryWrapper from "../../../components/MobileCategoryWrapper";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const MobileView = ({ isSettingPaid, isManagement }) => {
  const { t } = useTranslation(["Settings"]);
  const navigate = useNavigate();
  const baseUrl = isManagement ? "/" : "/portal-settings/customization";

  const onClickLink = (e) => {
    e.preventDefault();
    navigate(e.target.pathname);
  };

  return (
    <StyledWrapper>
      <MobileCategoryWrapper
        title={t("WhiteLabel")}
        subtitle={t("BrandingSubtitle")}
        url={`${baseUrl}/branding/white-label`}
        withPaidBadge={!isSettingPaid}
        badgeLabel={t("Common:Paid")}
        onClickLink={onClickLink}
      />
      <MobileCategoryWrapper
        title={t("CompanyInfoSettings")}
        subtitle={t("BrandingSectionDescription")}
        url={`${baseUrl}/branding/company-info-settings`}
        withPaidBadge={!isSettingPaid}
        badgeLabel={t("Common:Paid")}
        onClickLink={onClickLink}
      />
      <MobileCategoryWrapper
        title={t("AdditionalResources")}
        subtitle={t("AdditionalResourcesSubtitle")}
        url={`${baseUrl}/branding/additional-resources`}
        withPaidBadge={!isSettingPaid}
        badgeLabel={t("Common:Paid")}
        onClickLink={onClickLink}
      />
    </StyledWrapper>
  );
};

export default MobileView;
