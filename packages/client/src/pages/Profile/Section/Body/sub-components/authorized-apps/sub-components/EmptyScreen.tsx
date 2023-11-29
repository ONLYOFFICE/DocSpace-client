// @ts-ignore
import EmptyScreenContainer from "@docspace/components/empty-screen-container";

import EmptyScreenPersonsSvgUrl from "PUBLIC_DIR/images/empty_screen_userfields.svg?url";

const EmptyScreen = ({ t }: { t: any }) => {
  return (
    <EmptyScreenContainer
      imageSrc={EmptyScreenPersonsSvgUrl}
      imageAlt={"Empty apps list"}
      headerText={t("NoAuthorizedApps")}
      descriptionText={t("ProfileDescription")}
    />
  );
};

export default EmptyScreen;
