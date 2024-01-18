import { EmptyScreenContainer } from "@docspace/shared/components/empty-screen-container";

import EmptyScreenOauthSvgUrl from "PUBLIC_DIR/images/empty_screen_oauth.svg?url";

import RegisterNewButton from "../RegisterNewButton";

import { EmptyScreenProps } from "./EmptyScreen.types";
const OAuthEmptyScreen = ({ t }: EmptyScreenProps) => {
  return (
    <EmptyScreenContainer
      imageSrc={EmptyScreenOauthSvgUrl}
      imageAlt={"Empty oauth list"}
      headerText={t("NoOAuthAppHeader")}
      subheadingText={t("OAuthAppDescription")}
      buttons={<RegisterNewButton t={t} />}
    />
  );
};

export default OAuthEmptyScreen;
