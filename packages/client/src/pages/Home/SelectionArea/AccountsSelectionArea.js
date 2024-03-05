import React from "react";
import { isMobile } from "react-device-detect";
import { observer, inject } from "mobx-react";
import { SelectionArea as SelectionAreaComponent } from "@docspace/shared/components/selection-area";
import { useLocation, useParams } from "react-router-dom";

const SelectionArea = ({
  viewAs,
  setSelectionsPeople,
  setSelectionsGroups,
}) => {
  const { groupId } = useParams();
  const location = useLocation();

  const isPeopleSelections =
    !!groupId || location.pathname.includes("/accounts/people");

  const onMove = ({ added, removed, clear }) => {
    isPeopleSelections
      ? setSelectionsPeople(added, removed, clear)
      : setSelectionsGroups(added, removed, clear);
  };

  return isMobile ? (
    <></>
  ) : (
    <SelectionAreaComponent
      containerClass="section-scroll"
      scrollClass="section-scroll"
      itemsContainerClass="ReactVirtualized__Grid__innerScrollContainer"
      selectableClass="window-item"
      itemClass={isPeopleSelections ? "user-item" : "group-item"}
      onMove={onMove}
      viewAs={viewAs}
    />
  );
};

export default inject(({ peopleStore }) => {
  const { viewAs } = peopleStore;

  const { setSelections: setSelectionsPeople } = peopleStore.selectionStore;
  const { setSelections: setSelectionsGroups } = peopleStore.groupsStore;

  return {
    viewAs,
    setSelectionsPeople,
    setSelectionsGroups,
  };
})(observer(SelectionArea));
