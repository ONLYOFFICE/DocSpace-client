import { TGroupItem, TItem } from "./Filter.types";
import { FilterGroups, FilterKeys } from "../../enums";

export const syncGroupManagerCheckBox = (filterData: TItem[]) => {
  const filterGroupManager = filterData.find(
    (item) => item.group === FilterGroups.groupsFilterManager,
  );

  if (!filterGroupManager) return;

  const filterGroupMember = filterData.find(
    (item) => item.group === FilterGroups.groupsFilterMember,
  );

  if (!filterGroupMember) return;

  const isSomeMemberSelected = filterGroupMember.groupItem?.some(
    (item) => item.isSelected,
  );

  const checkBoxItem = filterGroupManager.groupItem?.[0];

  if (checkBoxItem && "isDisabled" in checkBoxItem) {
    checkBoxItem.isDisabled = !isSomeMemberSelected;
  }
};

export const removeGroupManagerFilterValueIfNeeded = (
  filterValues: TGroupItem[],
): TGroupItem[] => {
  const filterManager = filterValues.find(
    (item) => item.key === FilterKeys.byManager,
  );

  if (!filterManager) return filterValues;

  const hasFilterGroupMember = filterValues.some(
    (item) => item.group === FilterGroups.groupsFilterMember,
  );

  if (!hasFilterGroupMember) {
    return filterValues.filter(
      (item) => item.group !== FilterGroups.groupsFilterManager,
    );
  }

  return filterValues;
};
