import EmptyScreenGroupSvgUrl from "PUBLIC_DIR/images/empty_screen_groups.svg?url";
import EmptyScreenGroupSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_groups_dark.svg?url";
import PlusSvgUrl from "PUBLIC_DIR/images/plus.svg?url";
import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { EmptyScreenContainer } from "@docspace/shared/components/empty-screen-container";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Link } from "@docspace/shared/components/link";
import { Box } from "@docspace/shared/components/box";
import { Grid } from "@docspace/shared/components/grid";
import { Events } from "@docspace/shared/enums";

const EmptyScreenGroups = ({ theme }) => {
  const { t } = useTranslation(["People", "Common"]);

  const onResetFilter = () => {
    const event = new Event(Events.GROUP_CREATE);
    window.dispatchEvent(event);
  };

  const imageSrc = theme.isBase
    ? EmptyScreenGroupSvgUrl
    : EmptyScreenGroupSvgDarkUrl;

  return (
    <>
      <EmptyScreenContainer
        imageSrc={imageSrc}
        imageAlt="Empty Screen Filter image"
        headerText={t("No groups here yet")}
        descriptionText={t("Please create the first group.")}
        buttons={
          <Grid gridColumnGap="8px" columnsProp={["12px 1fr"]}>
            {
              <>
                <Box>
                  <IconButton
                    className="empty-folder_container-icon"
                    size="12"
                    onClick={onResetFilter}
                    iconName={PlusSvgUrl}
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
                    {t("Create group")}
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

export default inject(({ settingsStore }) => {
  return {
    theme: settingsStore.theme,
  };
})(observer(EmptyScreenGroups));
