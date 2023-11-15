import { useEffect, useContext } from "react";

import { DeviceType } from "@docspace/common/constants";
//@ts-ignore
import { Context } from "@docspace/components/utils/context";
import { isTablet, isMobile } from "@docspace/components/utils/device";

export type DeviceUnionType = (typeof DeviceType)[keyof typeof DeviceType];

type useViewEffectProps = {
  view: string;
  setView: (view: string) => void;
  currentDeviceType: DeviceUnionType;
};

type ContextType = {
  sectionWidth: number;
  sectionHeight: number;
};

const useViewEffect = ({
  view,
  setView,
  currentDeviceType,
}: useViewEffectProps) => {
  const { sectionWidth } = useContext<ContextType>(Context);

  useEffect(() => {
    const isNotRowView = view !== "row";
    const isNotTableView = view !== "table";

    if ((isNotTableView && isNotRowView) || !sectionWidth) return;

    if (
      (isTablet() || isMobile()) &&
      currentDeviceType !== DeviceType.desktop
    ) {
      isNotRowView && setView("row");
    } else {
      isNotTableView && setView("table");
    }
  }, [sectionWidth, currentDeviceType]);
};

export default useViewEffect;
