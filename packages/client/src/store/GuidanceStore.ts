import { makeAutoObservable } from "mobx";
import {
  GuidanceStep,
  GuidanceRefKey,
} from "@docspace/shared/components/guidance/sub-components/Guid.types";

type RefType = "direct" | "firstChildOffset";

interface RefInfo {
  ref: any;
  type: RefType;
}

class GuidanceStore {
  config: GuidanceStep[] = [];

  refMaps = new Map<GuidanceRefKey, RefInfo>();

  constructor() {
    makeAutoObservable(this);
  }

  setRefMap = (key: GuidanceRefKey, ref: any, type: RefType = "direct") => {
    this.refMaps.set(key, { ref, type });
  };

  deleteRefMap = (key: GuidanceRefKey) => {
    this.refMaps.delete(key);
  };

  getRefElement = (key: GuidanceRefKey) => {
    const refInfo = this.refMaps.get(key);
    if (!refInfo) return null;

    const { ref, type } = refInfo;

    switch (type) {
      case "direct":
        return ref?.current;
      case "firstChildOffset":
        return ref?.current?.firstChild?.offsetParent;
      default:
        return null;
    }
  };

  setConfig = (config: GuidanceStep[]) => {
    this.config = config;
  };
}

export default GuidanceStore;
