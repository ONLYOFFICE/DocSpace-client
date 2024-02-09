import EmptyScreenGroupSvgUrl from "PUBLIC_DIR/images/empty_screen_groups.svg?url";
import EmptyScreenGroupSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_groups_dark.svg?url";
import PlusSvgUrl from "PUBLIC_DIR/images/plus.svg?url";
import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import ClearEmptyFilterSvgUrl from "PUBLIC_DIR/images/clear.empty.filter.svg?url";

import { EmptyScreenContainer } from "@docspace/shared/components/empty-screen-container";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Link } from "@docspace/shared/components/link";
import { Box } from "@docspace/shared/components/box";
import { Grid } from "@docspace/shared/components/grid";
import { Events } from "@docspace/shared/enums";

const EmptyScreenGroups = ({
  groupsIsFiltered,
  resetGroupsFilter,
  setIsLoading,
  theme,
}) => {
  const { t } = useTranslation(["People", "Common"]);

  const onCreateRoom = () => {
    const event = new Event(Events.GROUP_CREATE);
    window.dispatchEvent(event);
  };

  const onResetFilter = () => {
    setIsLoading(true);
    resetGroupsFilter();
  };

  const imageSrc = theme.isBase
    ? EmptyScreenGroupSvgUrl
    : EmptyScreenGroupSvgDarkUrl;

  return (
    <>
      <EmptyScreenContainer
        imageSrc={imageSrc}
        imageAlt="Empty Screen Filter image"
        headerText={
          !groupsIsFiltered ? t("No groups here yet") : t("Nothing found")
        }
        descriptionText={
          !groupsIsFiltered
            ? t("Please create the first group.")
            : t(
                "No groups match this filter. Try a different one or clear filter to view all files. "
              )
        }
        buttons={
          <Grid gridColumnGap="8px" columnsProp={["12px 1fr"]}>
            {!groupsIsFiltered ? (
              <>
                <Box>
                  <IconButton
                    className="empty-folder_container-icon"
                    size="12"
                    onClick={onCreateRoom}
                    iconName={PlusSvgUrl}
                    isFill
                  />
                </Box>
                <Box marginProp="-4px 0 0 0">
                  <Link
                    type="action"
                    isHovered={true}
                    fontWeight="600"
                    onClick={onCreateRoom}
                  >
                    {t("Create group")}
                  </Link>
                </Box>
              </>
            ) : (
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
                    {t("Reset filter")}
                  </Link>
                </Box>
              </>
            )}
          </Grid>
        }
      />
    </>
  );
};

export default inject(({ peopleStore, clientLoadingStore, settingsStore }) => {
  const { groupsIsFiltered, resetGroupsFilter } = peopleStore.groupsStore;

  const { setIsSectionBodyLoading } = clientLoadingStore;

  const setIsLoading = (param) => {
    setIsSectionBodyLoading(param);
  };

  return {
    groupsIsFiltered,
    resetGroupsFilter,
    setIsLoading,
    theme: settingsStore.theme,
  };
})(observer(EmptyScreenGroups));
