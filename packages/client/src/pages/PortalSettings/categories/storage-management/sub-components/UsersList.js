import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import Text from "@docspace/components/text";
import Button from "@docspace/components/button";
import Filter from "@docspace/common/api/people/filter";

import { SortByFieldName } from "SRC_DIR/helpers/constants";

import { StyledStatistics, StyledSimpleFilesRow } from "../StyledComponent";

const StatisticsComponent = (props) => {
  const { peopleList, iconElement, textElement, quotaElement, buttonProps } =
    props;
  const { t } = useTranslation("Settings");
  const navigate = useNavigate();

  const onClickUsers = () => {
    const newFilter = Filter.getDefault();
    newFilter.sortBy = SortByFieldName.UsedSpace;
    const urlFilter = newFilter.toUrlParams();

    navigate(`/accounts/filter?${urlFilter}`);
  };

  const usersList = peopleList.map((item) => {
    const { fileExst, avatar, id, displayName, isRoom, defaultRoomIcon } = item;

    return (
      <StyledSimpleFilesRow key={id}>
        <>
          {iconElement(
            id,
            avatar,
            fileExst,
            isRoom,
            defaultRoomIcon,
            "user-icon"
          )}
          {textElement(displayName)}
          {quotaElement(item, "user")}
        </>
      </StyledSimpleFilesRow>
    );
  });

  return (
    <StyledStatistics>
      <div>
        <Text fontWeight={600} className="item-statistic">
          {t("Top5Users")}
        </Text>
        {usersList}

        <Button {...buttonProps} label={t("ShowMore")} onClick={onClickUsers} />
      </div>
    </StyledStatistics>
  );
};

export default inject(({ peopleStore }) => {
  const { usersStore } = peopleStore;
  const { peopleList } = usersStore;
  return {
    peopleList,
  };
})(observer(StatisticsComponent));
