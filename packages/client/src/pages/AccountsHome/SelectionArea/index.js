import React from "react";
import { isMobile } from "react-device-detect";
import { observer, inject } from "mobx-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { SelectionArea as SelectionAreaComponent } from "@docspace/shared/components/selection-area";

const SelectionArea = ({ viewAs, setSelections }) => {
  const location = useLocation();

  const isPeople = location.pathname.includes("/accounts/people");

  const onMove = ({ added, removed, clear }) => {
    isPeople
      ? setSelections(added, removed, clear)
      : setSelections(added, removed, clear);
  };

  const itemHeight = viewAs === "table" ? 49 : 59;

  return isMobile ? (
    <></>
  ) : (
    <SelectionAreaComponent
      containerClass="section-scroll"
      scrollClass="section-scroll"
      itemsContainerClass="ReactVirtualized__Grid__innerScrollContainer"
      selectableClass="window-item"
      itemClass={isPeople ? "user-item" : "group-item"}
      onMove={onMove}
      viewAs={viewAs}
      itemHeight={itemHeight}
    />
  );
};

export default inject(({ peopleStore }) => {
  const { viewAs } = peopleStore;
  const { setSelections } = peopleStore.selectionStore;

  return {
    viewAs,
    setSelections,
  };
})(observer(SelectionArea));
