import { useEffect, useState } from "react";

import api from "@docspace/common/api";
import { Selector } from "@docspace/shared/components/selector";

import { GroupsSelectorProps } from "./GroupsSelector.types";

export const GroupsSelector = (props: GroupsSelectorProps) => {
  const { id, onBackClick, ...rest } = props;

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

  const onLoadNextPage = async (startIndex: number) => {
    const res = await api.groups.getGroups();
    const convertedItems = res.map((group: any) => ({
      id: group.id,
      label: group.name,
    }));

    console.log(res);
    setItems(convertedItems);
  };

  useEffect(() => {
    onLoadNextPage(0);
  }, [searchValue]);

  return (
    <Selector
      id={id}
      headerLabel={"Group list"}
      onBackClick={onBackClick}
      onSearch={onSearchAction}
      onClearSearch={onClearSearchAction}
      onSelect={onSelectAction}
      items={items || []}
      acceptButtonLabel={"select"}
      onAccept={() => {}}
      withHeader={true}
      onCancel={onCancelAction}
      selectedItems={[]}
      totalItems={total || 3}
      loadNextPage={onLoadNextPage}
      isLoading={false}
    />
  );
};
