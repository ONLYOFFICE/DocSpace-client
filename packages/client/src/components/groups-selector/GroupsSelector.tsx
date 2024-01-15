import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import api from "@docspace/common/api";
import { Selector } from "@docspace/shared/components/selector";

import { GroupsSelectorProps } from "./GroupsSelector.types";

export const GroupsSelector = (props: GroupsSelectorProps) => {
  const { id, onBackClick, headerLabel, onAccept, ...rest } = props;

  const { t } = useTranslation(["GroupsSelector", "Common"]);

  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);

  const [total, setTotal] = useState(0);

  const [items, setItems] = useState([]);

  const onSearchAction = (value: string) => {
    setSearchValue(() => {
      setIsFirstLoad(true);

      return value;
    });
  };

  const onClearSearchAction = () => {
    setSearchValue(() => {
      setIsFirstLoad(true);

      return "";
    });
  };

  const onSelectAction = () => {};

  const onCancelAction = () => {};

  const onAcceptAction = (
    items: any,
    accessRights: any,
    fileName: string,
    isChecked: boolean,
  ) => {
    onAccept && onAccept(items);
  };

  const onLoadNextPage = async (startIndex: number) => {
    const res = await api.groups.getGroups();
    const convertedItems = res.map((group: any) => ({
      id: group.id,
      label: group.name,
    }));

    setItems(convertedItems);
  };

  useEffect(() => {
    onLoadNextPage(0);
  }, [searchValue]);

  return (
    <Selector
      id={id}
      headerLabel={headerLabel || t("Groups")}
      searchPlaceholder={t("Common:Search")}
      onBackClick={onBackClick}
      onSearch={onSearchAction}
      onClearSearch={onClearSearchAction}
      onSelect={onSelectAction}
      items={items || []}
      acceptButtonLabel={t("Common:SelectAction")}
      onAccept={onAcceptAction}
      withHeader={true}
      onCancel={onCancelAction}
      selectedItems={[]}
      totalItems={total || 3} // TODO: Fix total
      loadNextPage={onLoadNextPage}
      isLoading={false}
    />
  );
};
