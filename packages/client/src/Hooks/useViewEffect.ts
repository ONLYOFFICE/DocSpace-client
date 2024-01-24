import { useEffect, useContext } from "react";

import { DeviceType } from "@docspace/shared/enums";
//@ts-ignore
import { isTablet, isMobile, Context } from "@docspace/shared/utils";
import { isMobile as isMobileDevice } from "react-device-detect";

type DeviceUnionType = (typeof DeviceType)[keyof typeof DeviceType];

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
    console.log("useViewEffect");
    const isNotRowView = view !== "row";
    const isNotTableView = view !== "table";

    if ((isNotTableView && isNotRowView) || !sectionWidth) return;

    if (
      isMobileDevice ||
      ((isTablet() || isMobile()) && currentDeviceType !== DeviceType.desktop)
    ) {
      isNotRowView && setView("row");
    } else {
      isNotTableView && setView("table");
    }
  }, [sectionWidth, currentDeviceType]);
};

export default useViewEffect;
