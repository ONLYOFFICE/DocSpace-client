import { makeAutoObservable } from "mobx";
import { isDesktop } from "@docspace/shared/utils/device";

export class ViewState {
  privateViewAs =
    !isDesktop() && localStorage.getItem("viewAs") !== "tile"
      ? "row"
      : localStorage.getItem("viewAs") || "table";

  dragging = false;
  startDrag = false;
  tooltipPageX = 0;
  tooltipPageY = 0;

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false,
    });
  }

  setViewAs = (view) => {
    this.privateViewAs = view;
    localStorage.setItem("viewAs", view);
  };

  setDragging = (isDragging) => {
    this.dragging = isDragging;
  };

  setStartDrag = (isStartDrag) => {
    this.startDrag = isStartDrag;
  };

  setTooltipPosition = (x, y) => {
    this.tooltipPageX = x;
    this.tooltipPageY = y;
  };

  get viewAs() {
    return this.privateViewAs;
  }

  get isTileView() {
    return this.privateViewAs === "tile";
  }

  get isRowView() {
    return this.privateViewAs === "row";
  }

  get isTableView() {
    return this.privateViewAs === "table";
  }
}

export default ViewState;
