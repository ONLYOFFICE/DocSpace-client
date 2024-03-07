import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import Filter from "@docspace/shared/api/people/filter";

import { SortByFieldName } from "SRC_DIR/helpers/enums";

import { StyledStatistics, StyledSimpleFilesRow } from "../StyledComponent";

const StatisticsComponent = (props) => {
  const {
    peopleList,
    iconElement,
    textElement,
    quotaElement,
    buttonProps,
    peopleListLength,
  } = props;
  const { t } = useTranslation("Settings");
  const navigate = useNavigate();

  const onClickUsers = () => {
    const newFilter = Filter.getDefault();
    newFilter.sortBy = SortByFieldName.UsedSpace;
    const urlFilter = newFilter.toUrlParams();

    navigate(`/accounts/filter?${urlFilter}`);
  };

  const usersList = peopleList.map((item, index) => {
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

export default inject(({ peopleStore }) => {
  const { usersStore } = peopleStore;
  const { peopleList } = usersStore;

  const peopleListLength = peopleList.length;

  return {
    peopleList,
    peopleListLength,
  };
})(observer(StatisticsComponent));
