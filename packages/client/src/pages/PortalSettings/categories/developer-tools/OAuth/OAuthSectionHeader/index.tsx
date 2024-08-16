import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Headline from "@docspace/shared/components/headline/Headline";
import { IconButton } from "@docspace/shared/components/icon-button";

import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import LoaderSectionHeader from "SRC_DIR/pages/PortalSettings/Layout/Section/loaderSectionHeader";

import {
  StyledContainer,
  HeaderContainer,
} from "../../../../Layout/Section/Header";

const OAuthSectionHeader = ({ isEdit }: { isEdit: boolean }) => {
  const { t, ready } = useTranslation(["OAuth"]);

  const navigate = useNavigate();

  const onBack = () => {
    navigate("/portal-settings/developer-tools/oauth");
  };

  if (!ready) return <LoaderSectionHeader />;

  return (
    <StyledContainer>
      <HeaderContainer>
        <Headline type="content" truncate>
          <div className="settings-section_header">
            <IconButton
              iconName={ArrowPathReactSvgUrl}
              size={17}
              isFill
              onClick={onBack}
              className="arrow-button"
            />

            {isEdit ? t("EditApp") : t("NewApp")}
          </div>
        </Headline>
      </HeaderContainer>
    </StyledContainer>
  );
};

export default OAuthSectionHeader;
