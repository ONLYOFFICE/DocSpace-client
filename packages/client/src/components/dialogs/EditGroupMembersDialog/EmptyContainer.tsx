import { useTranslation } from "react-i18next";
import styled, { useTheme } from "styled-components";

import { EmptyScreenContainer } from "@docspace/shared/components/empty-screen-container";
import EmptyScreenPersonSvgUrl from "PUBLIC_DIR/images/empty_screen_persons.svg?url";
import EmptyScreenPersonSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_persons_dark.svg?url";

const StyledEmptyScreen = styled(EmptyScreenContainer)`
  box-sizing: border-box;
  width: 100%;
  padding: 45px 3px 0;
`;

const EmptyContainer = () => {
  const { t } = useTranslation("Common");
  const theme = useTheme();

  const imageSrc = theme.isBase
    ? EmptyScreenPersonSvgUrl
    : EmptyScreenPersonSvgDarkUrl;

  return (
    <StyledEmptyScreen
      imageSrc={imageSrc}
      imageAlt="Empty screen image"
      headerText={t("NotFoundUsers")}
      descriptionText={t("NotFoundUsersDescription")}
    />
  );
};

export default EmptyContainer;
