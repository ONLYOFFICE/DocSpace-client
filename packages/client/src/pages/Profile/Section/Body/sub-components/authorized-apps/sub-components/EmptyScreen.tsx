import { EmptyScreenContainer } from "@docspace/shared/components/empty-screen-container";
import { TTranslation } from "@docspace/shared/types";

import EmptyScreenPersonsSvgUrl from "PUBLIC_DIR/images/empty_screen_oauth.svg?url";

const EmptyScreen = ({ t }: { t: TTranslation }) => {
  return (
    <EmptyScreenContainer
      imageSrc={EmptyScreenPersonsSvgUrl}
      imageAlt="Empty apps list"
      headerText={t("NoAuthorizedApps")}
      descriptionText={t("ProfileDescription")}
    />
  );
};

export default EmptyScreen;
