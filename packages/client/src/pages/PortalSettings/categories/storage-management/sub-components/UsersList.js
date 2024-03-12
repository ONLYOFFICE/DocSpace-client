import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";

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
    const urlFilter = userFilterData.toUrlParams();

    currentUserId && localStorage.removeItem(`PeopleFilter=${currentUserId}`);
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

      {peopleListLength > 5 && (
        <Button
          {...buttonProps}
          label={t("Common:ShowMore")}
          onClick={onClickUsers}
        />
      )}
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
