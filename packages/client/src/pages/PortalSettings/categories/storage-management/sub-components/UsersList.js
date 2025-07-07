// (c) Copyright Ascensio System SIA 2009-2025
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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import Filter from "@docspace/shared/api/people/filter";
import { removeUserFilter } from "@docspace/shared/utils/userFilterUtils";
import { FILTER_PEOPLE } from "@docspace/shared/utils/filterConstants";

import { StyledStatistics, StyledSimpleFilesRow } from "../StyledComponent";

const StatisticsComponent = (props) => {
  const {
    accounts,
    iconElement,
    textElement,
    quotaElement,
    buttonProps,
    peopleListLength,
    userFilterData,
    currentUserId,
  } = props;
  const { t } = useTranslation("Settings");
  const navigate = useNavigate();

  const onClickUsers = () => {
    const defaultFilter = Filter.getDefault();
    userFilterData.pageCount = defaultFilter.pageCount;

    const urlFilter = userFilterData.toUrlParams();

    if (currentUserId) removeUserFilter(`${FILTER_PEOPLE}=${currentUserId}`);
    navigate(`/accounts/people/filter?${urlFilter}`);
  };

  const usersList = accounts.map((item, index) => {
    const { fileExst, avatar, id, displayName, isRoom, defaultRoomIcon } = item;

    if (index === 5) return;

    return (
      <StyledSimpleFilesRow key={id}>
        {iconElement(
          id,
          avatar,
          fileExst,
          isRoom,
          defaultRoomIcon,
          "user-icon",
          displayName,
        )}
        {textElement(displayName)}
        {quotaElement(item, "user")}
      </StyledSimpleFilesRow>
    );
  });

  return (
    <StyledStatistics>
      <Text fontWeight={600} className="item-statistic">
        {t("Top5Users")}
      </Text>
      {usersList}

      {peopleListLength > 5 ? (
        <Button
          {...buttonProps}
          label={t("Common:ShowMore")}
          onClick={onClickUsers}
        />
      ) : null}
    </StyledStatistics>
  );
};

export default inject(({ userStore, storageManagement }) => {
  const { accounts, userFilterData } = storageManagement;
  const peopleListLength = accounts.length;
  const { user } = userStore;

  return {
    currentUserId: user?.id,
    accounts,
    peopleListLength,
    userFilterData,
  };
})(observer(StatisticsComponent));
