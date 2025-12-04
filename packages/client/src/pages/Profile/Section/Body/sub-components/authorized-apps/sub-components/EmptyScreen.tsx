import EmptyScreenOauthSvgUrl from "PUBLIC_DIR/images/emptyview/empty.oauth.light.svg?url";
import EmptyScreenOauthDarkSvgUrl from "PUBLIC_DIR/images/emptyview/empty.oauth.dark.svg?url";

import { EmptyScreenContainer } from "@docspace/shared/components/empty-screen-container";
import { TTranslation } from "@docspace/shared/types";
import { useTheme } from "@docspace/shared/hooks/useTheme";

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
