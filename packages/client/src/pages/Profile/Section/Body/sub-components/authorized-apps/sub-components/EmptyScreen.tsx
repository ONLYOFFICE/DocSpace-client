import EmptyScreenOauthSvgUrl from "PUBLIC_DIR/images/emptyview/empty.oauth.light.svg?url";
import EmptyScreenOauthDarkSvgUrl from "PUBLIC_DIR/images/emptyview/empty.oauth.dark.svg?url";

import { useTheme } from "styled-components";
import { EmptyScreenContainer } from "@docspace/shared/components/empty-screen-container";
import { TTranslation } from "@docspace/shared/types";

const EmptyScreen = ({ t }: { t: TTranslation }) => {
  const { isBase } = useTheme();

  return (
    <EmptyScreenContainer
      imageSrc={isBase ? EmptyScreenOauthSvgUrl : EmptyScreenOauthDarkSvgUrl}
      imageAlt="Empty apps list"
      headerText={t("NoAuthorizedApps")}
      descriptionText={t("ProfileDescription")}
    />
  );
};

export default EmptyScreen;
