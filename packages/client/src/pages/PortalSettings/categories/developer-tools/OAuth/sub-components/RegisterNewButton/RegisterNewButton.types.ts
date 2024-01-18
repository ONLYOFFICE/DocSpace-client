import { TTranslation } from "@docspace/shared/types";

//@ts-ignore
import { DeviceUnionType } from "SRC_DIR/Hooks/useViewEffect";

export interface RegisterNewButtonProps {
  t: TTranslation;
  currentDeviceType?: DeviceUnionType;
}
