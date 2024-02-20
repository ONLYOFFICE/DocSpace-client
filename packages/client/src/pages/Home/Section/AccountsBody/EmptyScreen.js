import EmptyScreenPersonSvgUrl from "PUBLIC_DIR/images/empty_screen_persons.svg?url";
import EmptyScreenPersonSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_persons_dark.svg?url";
import ClearEmptyFilterSvgUrl from "PUBLIC_DIR/images/clear.empty.filter.svg?url";
import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { EmptyScreenContainer } from "@docspace/shared/components/empty-screen-container";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Link } from "@docspace/shared/components/link";
import { Box } from "@docspace/shared/components/box";
import { Grid } from "@docspace/shared/components/grid";

const EmptyScreen = ({
  resetFilter,
  resetInsideGroupFilter,
  setIsLoading,
  theme,
}) => {
  const { t } = useTranslation(["People", "Common"]);
  const isPeopleAccounts = window.location.pathname.includes("accounts/people");

  const title = t("NotFoundUsers");
  const description = t("NotFoundUsersDescription");

  const onResetFilter = () => {
    setIsLoading(true);
    isPeopleAccounts ? resetFilter() : resetInsideGroupFilter();
  };

  const imageSrc = theme.isBase
    ? EmptyScreenPersonSvgUrl
    : EmptyScreenPersonSvgDarkUrl;
  return (
    <>
      <EmptyScreenContainer
        imageSrc={imageSrc}
        imageAlt="Empty Screen Filter image"
        headerText={title}
        descriptionText={description}
        buttons={
          <Grid gridColumnGap="8px" columnsProp={["12px 1fr"]}>
            {
              <>
                <Box>
                  <IconButton
                    className="empty-folder_container-icon"
                    size="12"
                    onClick={onResetFilter}
                    iconName={ClearEmptyFilterSvgUrl}
                    isFill
                  />
                </Box>
                <Box marginProp="-4px 0 0 0">
                  <Link
                    type="action"
                    isHovered={true}
                    fontWeight="600"
                    onClick={onResetFilter}
                  >
                    {t("Common:ClearFilter")}
                  </Link>
                </Box>
              </>
            }
          </Grid>
        }
      />
    </>
  );
};

export default inject(({ peopleStore, clientLoadingStore, settingsStore }) => {
  const { resetFilter, groupsStore } = peopleStore;

  const { resetInsideGroupFilter } = groupsStore;

  const { setIsSectionBodyLoading } = clientLoadingStore;

  const setIsLoading = (param) => {
    setIsSectionBodyLoading(param);
  };
  return {
    resetFilter,
    resetInsideGroupFilter,

    setIsLoading,
    theme: settingsStore.theme,
  };
})(observer(EmptyScreen));
