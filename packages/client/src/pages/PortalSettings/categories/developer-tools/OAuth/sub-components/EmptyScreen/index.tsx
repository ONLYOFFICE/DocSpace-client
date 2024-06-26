import { useTranslation } from "react-i18next";

import { EmptyScreenContainer } from "@docspace/shared/components/empty-screen-container";

import EmptyScreenOauthSvgUrl from "PUBLIC_DIR/images/empty_screen_oauth.svg?url";

import RegisterNewButton from "../RegisterNewButton";

const OAuthEmptyScreen = () => {
  const { t } = useTranslation(["OAuth"]);

  return (
    <EmptyScreenContainer
      imageSrc={EmptyScreenOauthSvgUrl}
      imageAlt="Empty oauth list"
      headerText={t("NoOAuthAppHeader")}
      subheadingText={t("OAuthAppDescription")}
      buttons={<RegisterNewButton />}
    />
  );
};

export default OAuthEmptyScreen;
