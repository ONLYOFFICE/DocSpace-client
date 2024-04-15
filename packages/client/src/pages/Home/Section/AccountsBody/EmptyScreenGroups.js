// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
  const { t } = useTranslation(["People", "PeopleTranslations", "Common"]);

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
          !groupsIsFiltered
            ? t("Common:EmptyGroupsHeader")
            : t("Common:NotFoundGroups")
        }
        descriptionText={
          !groupsIsFiltered
            ? t("Common:EmptyGroupsDescription")
            : t("Common:NotFoundGroupsDescription")
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
                    {t("PeopleTranslations:CreateGroup")}
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
                    {t("Common:ClearFilter")}
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
