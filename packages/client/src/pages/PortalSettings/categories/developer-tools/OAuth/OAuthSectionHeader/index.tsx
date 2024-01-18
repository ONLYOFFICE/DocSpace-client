import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// @ts-ignore
import Headline from "@docspace/common/components/Headline";

import { IconButton } from "@docspace/shared/components/icon-button";

import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";

import { HeaderContainer } from "./SectionHeader.styled";
import { OAuthSectionHeaderProps } from "./SectionHeader.types";

const OAuthSectionHeader = ({ isEdit }: OAuthSectionHeaderProps) => {
  const { t } = useTranslation(["OAuth"]);

  const navigate = useNavigate();

  const onBack = () => {
    navigate("/portal-settings/developer-tools/oauth");
  };

  const NavigationHeader = () => (
    <>
      <IconButton
        iconName={ArrowPathReactSvgUrl}
        size={17}
        isFill
        onClick={onBack}
        className="arrow-button"
      />
      <Headline type="content" truncate className="headline">
        {isEdit ? t("EditApp") : t("NewApp")}
      </Headline>
    </>
  );

  return (
    <HeaderContainer>
      <NavigationHeader />
    </HeaderContainer>
  );
};

export default OAuthSectionHeader;
