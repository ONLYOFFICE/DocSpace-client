import { makeAutoObservable } from "mobx";
import {
  GuidanceStep,
  GuidanceRefKey,
} from "@docspace/shared/components/guidance/sub-components/Guid.types";
import { RefObject } from "react";

type RefType = "direct" | "firstChildOffset";

type ElementOrRef = HTMLElement | RefObject<HTMLElement | null>;

interface RefInfo {
  element: ElementOrRef;
  type: RefType;
}

class GuidanceStore {
  config: GuidanceStep[] = [];

  refMaps = new Map<GuidanceRefKey, RefInfo>();

  constructor() {
    makeAutoObservable(this);
  }

  setRefMap = (
    key: GuidanceRefKey,
    elementOrRef: ElementOrRef,
    type: RefType = "direct",
  ) => {
    this.refMaps.set(key, { element: elementOrRef, type });
  };

  deleteRefMap = (key: GuidanceRefKey) => {
    this.refMaps.delete(key);
  };

  getRefElement = (key: GuidanceRefKey) => {
    const refInfo = this.refMaps.get(key);
    if (!refInfo) return null;

    const { element, type } = refInfo;

    const domElement =
      element instanceof HTMLElement ? element : element?.current;

    if (!domElement) return null;

    switch (type) {
      case "direct":
        return domElement;
      case "firstChildOffset":
        return (domElement.firstChild as HTMLElement | null)?.offsetParent;
      default:
        return null;
    }
  };

  setConfig = (config: GuidanceStep[]) => {
    this.config = config;
  };
}

export default GuidanceStore;
